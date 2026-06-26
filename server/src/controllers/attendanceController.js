import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest } from '../utils/httpError.js';
import { round2 } from '../utils/money.js';

const toDate = (d) => new Date(`${d}T00:00:00.000Z`);

// GET /api/attendance?groupId=&date=
// Returns the group's enrolled students with any attendance already marked for
// that date (so the UI can prefill).
export const getRoster = asyncHandler(async (req, res) => {
  const { groupId, date } = req.query;
  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true, name: true } });
  if (!group) throw badRequest('المجموعة غير موجودة');

  const [subs, existing] = await Promise.all([
    prisma.subscription.findMany({
      where: { groupId, status: 'active' },
      include: { student: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.attendance.findMany({ where: { groupId, date: toDate(date) } }),
  ]);

  const byStudent = new Map(existing.map((a) => [a.studentId, a]));
  const roster = subs.map((s) => ({
    student: s.student,
    status: byStudent.get(s.student.id)?.status ?? null,
    note: byStudent.get(s.student.id)?.note ?? null,
  }));

  res.json({ group, date, roster });
});

// POST /api/attendance  (bulk upsert for a group + date)
export const markAttendance = asyncHandler(async (req, res) => {
  const { groupId, date, records } = req.body;
  const d = toDate(date);

  await prisma.$transaction(
    records.map((r) =>
      prisma.attendance.upsert({
        where: { studentId_groupId_date: { studentId: r.studentId, groupId, date: d } },
        create: { studentId: r.studentId, groupId, date: d, status: r.status, note: r.note ?? null },
        update: { status: r.status, note: r.note ?? null },
      })
    )
  );

  res.json({ message: 'تم حفظ الحضور', count: records.length });
});

// GET /api/attendance/report?groupId=&studentId=  (% attendance per student)
export const attendanceReport = asyncHandler(async (req, res) => {
  const { groupId, studentId } = req.query;
  const where = {};
  if (groupId) where.groupId = groupId;
  if (studentId) where.studentId = studentId;

  const records = await prisma.attendance.findMany({
    where,
    include: { student: { select: { id: true, name: true } } },
  });

  const map = new Map();
  for (const r of records) {
    if (!map.has(r.studentId)) {
      map.set(r.studentId, { student: r.student, present: 0, absent: 0, late: 0, total: 0 });
    }
    const s = map.get(r.studentId);
    s[r.status] += 1;
    s.total += 1;
  }

  const report = [...map.values()]
    .map((s) => ({ ...s, attendanceRate: s.total ? round2((s.present / s.total) * 100) : 0 }))
    .sort((a, b) => a.student.name.localeCompare(b.student.name, 'ar'));

  res.json({ report });
});

// GET /api/attendance/flags  (students with >3 absences this month)
export const attendanceFlags = asyncHandler(async (req, res) => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const records = await prisma.attendance.findMany({
    where: { status: 'absent', date: { gte: start, lt: next } },
    include: {
      student: { select: { id: true, name: true, phone: true } },
      group: { select: { id: true, name: true } },
    },
  });

  const map = new Map();
  for (const r of records) {
    if (!map.has(r.studentId)) map.set(r.studentId, { student: r.student, absences: 0, groups: new Set() });
    const s = map.get(r.studentId);
    s.absences += 1;
    s.groups.add(r.group.name);
  }

  const flagged = [...map.values()]
    .filter((s) => s.absences > 3)
    .map((s) => ({ student: s.student, absences: s.absences, groups: [...s.groups] }))
    .sort((a, b) => b.absences - a.absences);

  res.json({ flagged, threshold: 3 });
});
