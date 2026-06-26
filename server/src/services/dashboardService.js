import { prisma } from '../config/prisma.js';
import { num, round2 } from '../utils/money.js';
import { getOverdueList } from './overdueService.js';

// Admin dashboard aggregates.
export async function getDashboardStats() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const mo = now.getUTCMonth();
  const startThisMonth = new Date(Date.UTC(y, mo, 1));
  const startNextMonth = new Date(Date.UTC(y, mo + 1, 1));
  const startLastMonth = new Date(Date.UTC(y, mo - 1, 1));
  const weekAgo = new Date(Date.UTC(y, mo, now.getUTCDate() - 6));

  const [
    students,
    teachers,
    groups,
    thisMonthPays,
    lastMonthPays,
    presentThisWeek,
    markedThisWeek,
    overdue,
    recentPayments,
    recentStudents,
  ] = await Promise.all([
    prisma.student.count({ where: { status: 'active' } }),
    prisma.teacher.count(),
    prisma.group.count(),
    prisma.payment.findMany({
      where: { paidAt: { gte: startThisMonth, lt: startNextMonth } },
      select: { amount: true },
    }),
    prisma.payment.findMany({
      where: { paidAt: { gte: startLastMonth, lt: startThisMonth } },
      select: { amount: true },
    }),
    prisma.attendance.count({ where: { date: { gte: weekAgo }, status: 'present' } }),
    prisma.attendance.count({ where: { date: { gte: weekAgo } } }),
    getOverdueList(),
    prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { student: { select: { name: true } } },
    }),
    prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, name: true, createdAt: true },
    }),
  ]);

  const revenueThisMonth = round2(thisMonthPays.reduce((s, p) => s + num(p.amount), 0));
  const revenueLastMonth = round2(lastMonthPays.reduce((s, p) => s + num(p.amount), 0));

  const recentActivity = [
    ...recentPayments.map((p) => ({
      type: 'payment',
      at: p.createdAt,
      text: `دفعة ${num(p.amount)} ج.م من ${p.student.name} (شهر ${p.month})`,
    })),
    ...recentStudents.map((s) => ({
      type: 'student',
      at: s.createdAt,
      text: `تسجيل طالب جديد: ${s.name}`,
    })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8);

  return {
    totals: { students, teachers, groups },
    revenue: { thisMonth: revenueThisMonth, lastMonth: revenueLastMonth },
    attendanceRateThisWeek: markedThisWeek ? round2((presentThisWeek / markedThisWeek) * 100) : 0,
    overdue: { count: overdue.count, amount: overdue.totalAmount },
    recentActivity,
  };
}
