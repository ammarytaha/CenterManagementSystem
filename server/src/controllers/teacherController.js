import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest } from '../utils/httpError.js';
import { getTeacherEarnings } from '../services/earningsService.js';
import { currentMonthKey, isValidMonthKey } from '../utils/months.js';

// GET /api/teachers
export const listTeachers = asyncHandler(async (req, res) => {
  const teachers = await prisma.teacher.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { groups: true } } },
  });
  res.json({
    teachers: teachers.map(({ _count, ...t }) => ({ ...t, groupCount: _count.groups })),
  });
});

// POST /api/teachers
export const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await prisma.teacher.create({ data: req.body });
  res.status(201).json({ teacher });
});

// PUT /api/teachers/:id
export const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await prisma.teacher.update({ where: { id: req.params.id }, data: req.body });
  res.json({ teacher });
});

// GET /api/teachers/:id  (profile: groups + monthly earnings)
export const getTeacher = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: { groups: { include: { _count: { select: { subscriptions: true } } } } },
  });
  if (!teacher) throw badRequest('المدرّس غير موجود');

  const month = isValidMonthKey(req.query.month) ? req.query.month : currentMonthKey();
  const earnings = await getTeacherEarnings(id, month);

  const { groups, ...teacherData } = teacher;
  res.json({
    teacher: teacherData,
    groups: groups.map(({ _count, ...g }) => ({ ...g, studentCount: _count.subscriptions })),
    earnings,
  });
});
