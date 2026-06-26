import { prisma } from '../config/prisma.js';
import { verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { unauthorized } from '../utils/httpError.js';

// Never leak the password hash to clients.
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  // Same message whether the email or the password is wrong (no user enumeration).
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw unauthorized('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  const token = signToken({
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  res.json({ token, user: publicUser(user) });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw unauthorized('المستخدم غير موجود');
  res.json({ user: publicUser(user) });
});
