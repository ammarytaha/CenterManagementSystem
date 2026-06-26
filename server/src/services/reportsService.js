import { prisma } from '../config/prisma.js';
import { num, round2 } from '../utils/money.js';
import { startOfMonth, endOfMonthExclusive } from '../utils/months.js';

// Monthly revenue: total expected (active subscription fees), total collected
// (payments settling that month), and a per-group breakdown. Since payments are
// not stored per-group, a student's payment is attributed across their active
// subscriptions in proportion to each group's fee.
export async function getRevenueReport(month) {
  const subs = await prisma.subscription.findMany({
    where: { status: 'active', startDate: { lt: endOfMonthExclusive(month) } },
    include: {
      group: { select: { id: true, name: true } },
      student: { select: { payments: { where: { month }, select: { amount: true } } } },
    },
  });

  // Aggregate each student's subs + total paid so we can attribute proportionally.
  const byStudent = new Map();
  for (const sub of subs) {
    if (!byStudent.has(sub.studentId)) {
      const paid = sub.student.payments.reduce((s, p) => s + num(p.amount), 0);
      byStudent.set(sub.studentId, { paid, subs: [] });
    }
    byStudent.get(sub.studentId).subs.push(sub);
  }

  const groups = new Map();
  const ensureGroup = (g) => {
    if (!groups.has(g.id)) groups.set(g.id, { group: g, expected: 0, collected: 0 });
    return groups.get(g.id);
  };

  let totalExpected = 0;
  let totalCollected = 0;

  for (const { paid, subs: studentSubs } of byStudent.values()) {
    const owed = studentSubs.reduce((s, x) => s + num(x.monthlyFee), 0);
    totalExpected += owed;
    totalCollected += paid;
    for (const sub of studentSubs) {
      const entry = ensureGroup(sub.group);
      const fee = num(sub.monthlyFee);
      entry.expected += fee;
      entry.collected += owed > 0 ? paid * (fee / owed) : 0;
    }
  }

  const breakdown = [...groups.values()]
    .map(({ group, expected, collected }) => ({
      group,
      expected: round2(expected),
      collected: round2(collected),
      overdue: round2(Math.max(0, expected - collected)),
    }))
    .sort((a, b) => b.expected - a.expected);

  return {
    month,
    totalExpected: round2(totalExpected),
    totalCollected: round2(totalCollected),
    totalOverdue: round2(breakdown.reduce((s, b) => s + b.overdue, 0)),
    breakdown,
  };
}

// Attendance summary by group for a month.
export async function getAttendanceReport(month) {
  const records = await prisma.attendance.findMany({
    where: { date: { gte: startOfMonth(month), lt: endOfMonthExclusive(month) } },
    include: { group: { select: { id: true, name: true } } },
  });

  const groups = new Map();
  for (const r of records) {
    if (!groups.has(r.groupId)) {
      groups.set(r.groupId, { group: r.group, present: 0, absent: 0, late: 0, total: 0 });
    }
    const g = groups.get(r.groupId);
    g[r.status] += 1;
    g.total += 1;
  }

  const breakdown = [...groups.values()]
    .map((g) => ({
      group: g.group,
      present: g.present,
      absent: g.absent,
      late: g.late,
      total: g.total,
      attendanceRate: g.total ? round2((g.present / g.total) * 100) : 0,
    }))
    .sort((a, b) => a.group.name.localeCompare(b.group.name, 'ar'));

  const totals = breakdown.reduce(
    (acc, b) => ({
      present: acc.present + b.present,
      absent: acc.absent + b.absent,
      late: acc.late + b.late,
      total: acc.total + b.total,
    }),
    { present: 0, absent: 0, late: 0, total: 0 }
  );

  return {
    month,
    totals: {
      ...totals,
      attendanceRate: totals.total ? round2((totals.present / totals.total) * 100) : 0,
    },
    breakdown,
  };
}
