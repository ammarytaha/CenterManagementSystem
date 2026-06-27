import { z } from 'zod';

const role = z.enum(['admin', 'teacher', 'assistant'], {
  errorMap: () => ({ message: 'الدور يجب أن يكون admin أو teacher أو assistant' }),
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
  role,
  // Optional teaching profile to link (when role = teacher).
  teacherId: z.coerce.number().int().positive().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email('بريد إلكتروني غير صالح').optional(),
  role: role.optional(),
  teacherId: z.coerce.number().int().positive().nullable().optional(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
});
