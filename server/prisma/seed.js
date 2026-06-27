import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const pad = (n) => String(n).padStart(2, '0');
const monthKey = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;

// First UTC day of the month `offset` months from the current month.
const firstOfMonth = (offset) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
};

// Small deterministic PRNG so re-seeding yields stable-ish data.
let rng = 987654321;
const rand = () => {
  rng = (rng * 1103515245 + 12345) & 0x7fffffff;
  return rng / 0x7fffffff;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const phone = (prefix) => prefix + pick(['0', '1', '2', '5']) + String(Math.floor(rand() * 1e8)).padStart(8, '0');

// Receipt counters keyed by YYYYMM (mirrors the controller's scheme).
const receiptCounters = new Map();
const nextReceipt = (paidAt) => {
  const ym = `${paidAt.getUTCFullYear()}${pad(paidAt.getUTCMonth() + 1)}`;
  const n = (receiptCounters.get(ym) || 0) + 1;
  receiptCounters.set(ym, n);
  return `RCP-${ym}-${String(n).padStart(4, '0')}`;
};

const DAY_OF_WEEK = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

async function main() {
  // Wipe in FK-safe order.
  await prisma.attendance.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.student.deleteMany();
  await prisma.group.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  // --- Users (all share the demo password) ---
  const passwordHash = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.create({
    data: { name: 'مدير النظام', email: 'admin@loop.eg', role: 'admin', passwordHash },
  });
  const assistant = await prisma.user.create({
    data: { name: 'مساعد الإدارة', email: 'assistant@loop.eg', role: 'assistant', passwordHash },
  });

  // --- Teachers ---
  const teacherDefs = [
    { name: 'أ. محمد عبد الله', subject: 'رياضيات', compensationType: 'salary', compensationValue: 8000 },
    { name: 'أ. منى السيد', subject: 'لغة عربية', compensationType: 'percentage', compensationValue: 30 },
    { name: 'أ. أحمد فؤاد', subject: 'فيزياء', compensationType: 'percentage', compensationValue: 25 },
    { name: 'أ. سارة كمال', subject: 'كيمياء', compensationType: 'salary', compensationValue: 7000 },
    { name: 'أ. خالد إبراهيم', subject: 'لغة إنجليزية', compensationType: 'percentage', compensationValue: 35 },
  ];
  // Each teacher also gets a login (role=teacher) linked to their profile so
  // they can sign in and see only their own groups.
  const teachers = [];
  for (let i = 0; i < teacherDefs.length; i += 1) {
    const t = teacherDefs[i];
    const teacher = await prisma.teacher.create({ data: { ...t, phone: phone('010') } });
    const login = await prisma.user.create({
      data: {
        name: t.name,
        email: i === 0 ? 'teacher@loop.eg' : `teacher${i + 1}@loop.eg`,
        role: 'teacher',
        passwordHash,
      },
    });
    await prisma.teacher.update({ where: { id: teacher.id }, data: { userId: login.id } });
    teachers.push(teacher);
  }

  // --- Groups ---
  const groupDefs = [
    { name: 'رياضيات - الثالث الثانوي', t: 0, subject: 'رياضيات', scheduleDays: ['sat', 'tue'], startTime: '16:00', endTime: '18:00', monthlyFee: 500 },
    { name: 'رياضيات - الثاني الثانوي', t: 0, subject: 'رياضيات', scheduleDays: ['sun', 'wed'], startTime: '14:00', endTime: '16:00', monthlyFee: 450 },
    { name: 'لغة عربية - الثالث الثانوي', t: 1, subject: 'لغة عربية', scheduleDays: ['mon', 'thu'], startTime: '10:00', endTime: '12:00', monthlyFee: 400 },
    { name: 'فيزياء - الثالث الثانوي', t: 2, subject: 'فيزياء', scheduleDays: ['sat', 'tue'], startTime: '18:00', endTime: '20:00', monthlyFee: 480 },
    { name: 'كيمياء - الثاني الثانوي', t: 3, subject: 'كيمياء', scheduleDays: ['sun', 'wed'], startTime: '16:00', endTime: '18:00', monthlyFee: 460 },
    { name: 'لغة إنجليزية - الثالث الثانوي', t: 4, subject: 'لغة إنجليزية', scheduleDays: ['mon', 'thu'], startTime: '12:00', endTime: '14:00', monthlyFee: 520 },
  ];
  const groups = [];
  for (const g of groupDefs) {
    const { t, ...rest } = g;
    groups.push(await prisma.group.create({ data: { ...rest, teacherId: teachers[t].id } }));
  }

  // --- Students + subscriptions ---
  const firstNames = ['أحمد', 'محمود', 'يوسف', 'عمر', 'خالد', 'مصطفى', 'كريم', 'زياد', 'عبدالرحمن', 'مازن', 'سيف', 'آدم', 'حمزة', 'مالك', 'نور', 'سلمى', 'مريم', 'حبيبة', 'جنى', 'ملك', 'فاطمة', 'رنا', 'لينا', 'هنا', 'تالا', 'ريم', 'ندى', 'يارا'];
  const lastNames = ['محمد', 'علي', 'حسن', 'إبراهيم', 'السيد', 'عبدالله', 'فاروق', 'رمضان', 'عادل', 'سمير', 'فتحي'];
  const areas = ['مدينة نصر', 'المعادي', 'مصر الجديدة', 'حلوان', 'الهرم', 'شبرا', 'المنيل'];
  const subStart = firstOfMonth(-3);

  const studentsInfo = []; // { id, status, totalFee }
  for (let i = 0; i < 28; i += 1) {
    const primaryGroup = groups[i % groups.length];
    const status = rand() < 0.1 ? 'inactive' : 'active';
    const student = await prisma.student.create({
      data: {
        name: `${pick(firstNames)} ${pick(lastNames)}`,
        phone: phone('011'),
        address: pick(areas),
        parentName: `${pick(firstNames)} ${pick(lastNames)}`,
        parentPhone: phone('012'),
        groupId: primaryGroup.id,
        status,
      },
    });

    const subGroups = [primaryGroup];
    if (rand() < 0.25) {
      const second = groups[(i + 3) % groups.length];
      if (second.id !== primaryGroup.id) subGroups.push(second);
    }
    let totalFee = 0;
    for (const g of subGroups) {
      await prisma.subscription.create({
        data: { studentId: student.id, groupId: g.id, monthlyFee: g.monthlyFee, startDate: subStart, status: 'active' },
      });
      totalFee += Number(g.monthlyFee);
    }
    studentsInfo.push({ id: student.id, status, totalFee });
  }

  // --- Payments: settle older months (~80%), leave the current month mostly
  // unpaid so overdue/revenue figures are interesting ---
  const methods = ['vodafone_cash', 'instapay', 'cash'];
  const payments = [];
  for (const s of studentsInfo) {
    for (const offset of [-3, -2, -1]) {
      if (rand() < 0.8) {
        const m = firstOfMonth(offset);
        const paidAt = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), 5 + Math.floor(rand() * 12)));
        payments.push({
          studentId: s.id, amount: s.totalFee, month: monthKey(m),
          method: pick(methods), staffId: assistant.id, paidAt, receiptNumber: nextReceipt(paidAt),
        });
      }
    }
    if (rand() < 0.3) {
      const paidAt = new Date();
      payments.push({
        studentId: s.id, amount: s.totalFee, month: monthKey(firstOfMonth(0)),
        method: pick(methods), staffId: assistant.id, paidAt, receiptNumber: nextReceipt(paidAt),
      });
    }
  }
  await prisma.payment.createMany({ data: payments });

  // --- Attendance for the last 21 days on each group's schedule days ---
  const statusPool = ['present', 'present', 'present', 'present', 'late', 'absent'];
  const today = new Date();
  const attendance = [];
  for (const group of groups) {
    const subs = await prisma.subscription.findMany({
      where: { groupId: group.id, status: 'active' },
      include: { student: { select: { id: true, status: true } } },
    });
    const activeStudents = subs.filter((x) => x.student.status === 'active');
    for (let back = 0; back < 21; back += 1) {
      const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - back));
      const dayName = Object.keys(DAY_OF_WEEK).find((k) => DAY_OF_WEEK[k] === d.getUTCDay());
      if (!group.scheduleDays.includes(dayName)) continue;
      for (const sub of activeStudents) {
        attendance.push({ studentId: sub.studentId, groupId: group.id, date: d, status: pick(statusPool) });
      }
    }
  }
  await prisma.attendance.createMany({ data: attendance, skipDuplicates: true });

  console.log('✔ Seed complete');
  console.log(`  users:    admin@loop.eg · assistant@loop.eg · teacher@loop.eg  (password: password123)`);
  console.log(`  teachers: ${teachers.length}  groups: ${groups.length}  students: ${studentsInfo.length}`);
  console.log(`  payments: ${payments.length}  attendance: ${attendance.length}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
