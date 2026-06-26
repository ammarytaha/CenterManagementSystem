import { prisma } from '../config/prisma.js';
import { num, round2 } from '../utils/money.js';
import { enumerateMonths, currentMonthKey } from '../utils/months.js';

// ---------------------------------------------------------------------------
// Overdue / dues logic.
//
// A student owes, for every month from each active subscription's start month
// up to the current month, the sum of that subscription's monthly fee. A
// payment whose `month` matches settles that month's total fee (payments are
// not tracked per-group — documented simplification). A month is overdue when
// the amount paid for it is less than the amount owed.
// ---------------------------------------------------------------------------

// owedByMonth: Map<monthKey, amount> from a list of active subscriptions.
function owedByMonthFrom(subscriptions, nowKey) {
  const owed = new Map();
  for (const sub of subscriptions) {
    for (const m of enumerateMonths(sub.startDate, nowKey)) {
      owed.set(m, num(owed.get(m)) + num(sub.monthlyFee));
    }
  }
  return owed;
}

// paidByMonth: Map<monthKey, amount> from a list of payments.
function paidByMonthFrom(payments) {
  const paid = new Map();
  for (const p of payments) {
    paid.set(p.month, num(paid.get(p.month)) + num(p.amount));
  }
  return paid;
}

// Per-month dues for one student. With onlyUnpaid, returns only months that
// still have a remaining balance (used by the payment-recording flow).
export async function getStudentDueMonths(studentId, { onlyUnpaid = true } = {}) {
  const [subs, payments] = await Promise.all([
    prisma.subscription.findMany({ where: { studentId, status: 'active' } }),
    prisma.payment.findMany({ where: { studentId } }),
  ]);
  if (subs.length === 0) return [];

  const nowKey = currentMonthKey();
  const owed = owedByMonthFrom(subs, nowKey);
  const paid = paidByMonthFrom(payments);

  const rows = [];
  for (const month of [...owed.keys()].sort()) {
    const owedAmt = num(owed.get(month));
    const paidAmt = num(paid.get(month));
    const remaining = round2(Math.max(0, owedAmt - paidAmt));
    if (!onlyUnpaid || remaining > 0) {
      rows.push({ month, owed: round2(owedAmt), paid: round2(paidAmt), remaining });
    }
  }
  return rows;
}

// Total outstanding balance for one student.
export async function getStudentBalance(studentId) {
  const months = await getStudentDueMonths(studentId, { onlyUnpaid: true });
  const totalRemaining = round2(months.reduce((s, r) => s + r.remaining, 0));
  return { monthsOverdue: months.length, totalRemaining, months };
}

// Overdue list across all active students. When `month` is given, only that
// settlement month is considered; otherwise all months up to now.
export async function getOverdueList({ month } = {}) {
  const students = await prisma.student.findMany({
    where: { status: 'active', subscriptions: { some: { status: 'active' } } },
    include: {
      subscriptions: { where: { status: 'active' } },
      group: { select: { id: true, name: true } },
    },
  });
  const payments = await prisma.payment.findMany({
    select: { studentId: true, month: true, amount: true },
  });

  const paymentsByStudent = new Map();
  for (const p of payments) {
    if (!paymentsByStudent.has(p.studentId)) paymentsByStudent.set(p.studentId, []);
    paymentsByStudent.get(p.studentId).push(p);
  }

  const nowKey = currentMonthKey();
  const rows = [];
  let totalAmount = 0;

  for (const s of students) {
    const owed = owedByMonthFrom(s.subscriptions, nowKey);
    const paid = paidByMonthFrom(paymentsByStudent.get(s.id) || []);
    const targetMonths = month ? [month] : [...owed.keys()];

    let remaining = 0;
    let monthsOverdue = 0;
    for (const m of targetMonths) {
      const owedAmt = num(owed.get(m));
      if (owedAmt === 0) continue;
      const r = Math.max(0, owedAmt - num(paid.get(m)));
      if (r > 0) {
        remaining += r;
        monthsOverdue += 1;
      }
    }

    if (remaining > 0) {
      rows.push({
        student: { id: s.id, name: s.name, phone: s.phone, group: s.group },
        monthsOverdue,
        totalRemaining: round2(remaining),
      });
      totalAmount += remaining;
    }
  }

  rows.sort((a, b) => b.totalRemaining - a.totalRemaining);
  return { count: rows.length, totalAmount: round2(totalAmount), students: rows };
}
