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
});

// GET /api/users
export const listUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ users: users.map(publicUser) });
});

// POST /api/users
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict('البريد الإلكتروني مستخدم بالفعل');

  const user = await prisma.user.create({
    data: { name, email, role, passwordHash: await hashPassword(password) },
  });
  res.status(201).json({ user: publicUser(user) });
});

// PUT /api/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (req.body.email) {
    const dup = await prisma.user.findFirst({ where: { email: req.body.email, NOT: { id } } });
    if (dup) throw conflict('البريد الإلكتروني مستخدم بالفعل');
  }
  const user = await prisma.user.update({ where: { id }, data: req.body });
  res.json({ user: publicUser(user) });
});

// PATCH /api/users/:id/password
export const resetUserPassword = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await prisma.user.update({
    where: { id },
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
