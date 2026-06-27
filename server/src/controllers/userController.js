import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashPassword } from '../utils/password.js';
import { conflict, badRequest } from '../utils/httpError.js';

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt,
  teacher: u.teacher ? { id: u.teacher.id, name: u.teacher.name } : null,
});

const withTeacher = { include: { teacher: { select: { id: true, name: true } } } };

// Point a teaching profile at this login, clearing any previous link first
// (Teacher.userId is unique — one login per profile).
async function linkUserToTeacher(tx, userId, teacherId) {
  await tx.teacher.updateMany({ where: { userId }, data: { userId: null } });
  if (teacherId) await tx.teacher.update({ where: { id: teacherId }, data: { userId } });
}

// GET /api/users
export const listUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, ...withTeacher });
  res.json({ users: users.map(publicUser) });
});

// POST /api/users
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, teacherId } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict('البريد الإلكتروني مستخدم بالفعل');

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name, email, role, passwordHash: await hashPassword(password) },
    });
    if (role === 'teacher' && teacherId) await linkUserToTeacher(tx, created.id, teacherId);
    return created;
  });

  const full = await prisma.user.findUnique({ where: { id: user.id }, ...withTeacher });
  res.status(201).json({ user: publicUser(full) });
});

// PUT /api/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { teacherId, ...data } = req.body;

  if (data.email) {
    const dup = await prisma.user.findFirst({ where: { email: data.email, NOT: { id } } });
    if (dup) throw conflict('البريد الإلكتروني مستخدم بالفعل');
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data });
    if (data.role && data.role !== 'teacher') await linkUserToTeacher(tx, id, null);
    else if (teacherId !== undefined) await linkUserToTeacher(tx, id, teacherId);
  });

  const full = await prisma.user.findUnique({ where: { id }, ...withTeacher });
  res.json({ user: publicUser(full) });
});

// PATCH /api/users/:id/password
export const resetUserPassword = asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: { id: req.params.id },
    data: { passwordHash: await hashPassword(req.body.password) },
  });
  res.json({ message: 'تم تحديث كلمة المرور' });
});

// DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (id === req.user.id) throw badRequest('لا يمكنك حذف حسابك الخاص');
  await prisma.user.delete({ where: { id } });
  res.json({ message: 'تم حذف المستخدم' });
});
