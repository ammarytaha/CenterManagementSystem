import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest } from '../utils/httpError.js';
import { getTeacherEarnings } from '../services/earningsService.js';
import { currentMonthKey, isValidMonthKey } from '../utils/months.js';
import { teacherIdForUser } from '../utils/teacherScope.js';

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

// Builds the profile payload (info + groups + monthly earnings) for a teacher.
async function buildProfile(id, monthParam) {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: { groups: { include: { _count: { select: { subscriptions: true } } } } },
  });
  if (!teacher) throw badRequest('المدرّس غير موجود');

  const month = isValidMonthKey(monthParam) ? monthParam : currentMonthKey();
  const earnings = await getTeacherEarnings(id, month);

  const { groups, ...teacherData } = teacher;
  return {
    teacher: teacherData,
    groups: groups.map(({ _count, ...g }) => ({ ...g, studentCount: _count.subscriptions })),
    earnings,
  };
}

// GET /api/teachers/:id  (admin/assistant — any teacher)
export const getTeacher = asyncHandler(async (req, res) => {
  res.json(await buildProfile(req.params.id, req.query.month));
});

// GET /api/teachers/me  (teacher — their own profile + earnings)
export const getMyProfile = asyncHandler(async (req, res) => {
  const id = await teacherIdForUser(req.user.id);
  if (!id) throw badRequest('لا يوجد ملف مدرّس مرتبط بحسابك');
  res.json(await buildProfile(id, req.query.month));
});

// DELETE /api/teachers/:id  (admin — blocked while the teacher has groups)
export const deleteTeacher = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const groupCount = await prisma.group.count({ where: { teacherId: id } });
  if (groupCount > 0) {
    throw badRequest('لا يمكن حذف مدرّس مرتبط بمجموعات. انقل أو احذف مجموعاته أولًا');
  }
  await prisma.teacher.delete({ where: { id } });
  res.json({ message: 'تم حذف المدرّس' });
});
