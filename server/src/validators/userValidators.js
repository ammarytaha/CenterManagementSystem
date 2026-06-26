import { z } from 'zod';

const role = z.enum(['admin', 'staff', 'accountant'], {
  errorMap: () => ({ message: 'الدور يجب أن يكون admin أو staff أو accountant' }),
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
  role,
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email('بريد إلكتروني غير صالح').optional(),
  role: role.optional(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
});
