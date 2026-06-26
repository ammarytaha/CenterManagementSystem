import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest } from '../utils/httpError.js';
import { getStudentBalance } from '../services/overdueService.js';

// Date-only value (UTC midnight) for @db.Date columns.
const today = () => new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);

// Assigning a student to a group also enrolls them: ensure an active
// subscription for (student, group) using the group's current monthly fee.
async function ensureSubscription(tx, studentId, groupId) {
  const group = await tx.group.findUnique({ where: { id: groupId } });
  if (!group) throw badRequest('المجموعة المحددة غير موجودة');
  await tx.subscription.upsert({
    where: { studentId_groupId: { studentId, groupId } },
    create: { studentId, groupId, monthlyFee: group.monthlyFee, startDate: today(), status: 'active' },
    update: { status: 'active' },
  });
}

// GET /api/students?search=&groupId=&status=&page=&pageSize=
export const listStudents = asyncHandler(async (req, res) => {
  const { search, groupId, status, page, pageSize } = req.query;

  const where = {};
  if (status) where.status = status;
  if (groupId) where.groupId = groupId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { group: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ]);

  res.json({ students, total, page, pageSize });
});

// POST /api/students
export const createStudent = asyncHandler(async (req, res) => {
  const { groupId, ...data } = req.body;

  const student = await prisma.$transaction(async (tx) => {
    const created = await tx.student.create({ data: { ...data, groupId: groupId ?? null } });
    if (groupId) await ensureSubscription(tx, created.id, groupId);
    return created;
  });

  res.status(201).json({ student });
});

// GET /api/students/:id  (full profile)
export const getStudent = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      group: { select: { id: true, name: true } },
      subscriptions: { include: { group: { select: { id: true, name: true, subject: true } } } },
      attendance: {
        orderBy: { date: 'desc' },
        take: 50,
        include: { group: { select: { id: true, name: true } } },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
        include: { staff: { select: { id: true, name: true } } },
      },
    },
  });
  if (!student) throw badRequest('الطالب غير موجود');

  const balance = await getStudentBalance(id);
  res.json({ student, balance });
});

// PUT /api/students/:id
export const updateStudent = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { groupId, ...data } = req.body;

  const student = await prisma.$transaction(async (tx) => {
    const updated = await tx.student.update({
      where: { id },
      data: { ...data, ...(groupId !== undefined ? { groupId: groupId ?? null } : {}) },
    });
    if (groupId) await ensureSubscription(tx, id, groupId);
    return updated;
  });

  res.json({ student });
});

// PATCH /api/students/:id/deactivate
export const deactivateStudent = asyncHandler(async (req, res) => {
  const student = await prisma.student.update({
    where: { id: req.params.id },
    data: { status: 'inactive' },
  });
  res.json({ student });
});
