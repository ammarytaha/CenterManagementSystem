import { prisma } from '../config/prisma.js';
import { num, round2 } from '../utils/money.js';
import { currentMonthKey } from '../utils/months.js';

// Teacher earnings for a month.
//   salary     -> fixed compensationValue
//   percentage -> compensationValue% of payments collected in `month` from
//                 students enrolled (active subscription) in the teacher's groups
// (A student in several teachers' groups counts toward each — documented
// simplification, matching the brief.)
export async function getTeacherEarnings(teacherId, month = currentMonthKey()) {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      groups: {
        include: { subscriptions: { where: { status: 'active' }, select: { studentId: true } } },
      },
    },
  });
  if (!teacher) return null;

  const value = num(teacher.compensationValue);

  if (teacher.compensationType === 'salary') {
    return { month, type: 'salary', value, collected: null, earnings: round2(value) };
  }

  const studentIds = new Set();
  for (const g of teacher.groups) {
    for (const sub of g.subscriptions) studentIds.add(sub.studentId);
  }

  let collected = 0;
  if (studentIds.size > 0) {
    const payments = await prisma.payment.findMany({
      where: { month, studentId: { in: [...studentIds] } },
      select: { amount: true },
    });
    collected = payments.reduce((s, p) => s + num(p.amount), 0);
  }

  return {
    month,
    type: 'percentage',
    value,
    collected: round2(collected),
    earnings: round2((collected * value) / 100),
  };
}

// Earnings for every teacher in a month (used by the reports page).
export async function getAllTeacherEarnings(month = currentMonthKey()) {
  const teachers = await prisma.teacher.findMany({ orderBy: { name: 'asc' } });
  const rows = await Promise.all(
    teachers.map(async (t) => ({
      teacher: { id: t.id, name: t.name, subject: t.subject },
      ...(await getTeacherEarnings(t.id, month)),
    }))
  );
  const total = round2(rows.reduce((s, r) => s + r.earnings, 0));
  return { month, total, teachers: rows };
}
