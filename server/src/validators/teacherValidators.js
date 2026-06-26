import { z } from 'zod';

const compensationType = z.enum(['salary', 'percentage'], {
  errorMap: () => ({ message: 'نوع الأجر يجب أن يكون salary أو percentage' }),
});

export const createTeacherSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  phone: z.string().min(1, 'رقم الهاتف مطلوب'),
  subject: z.string().min(1, 'المادة مطلوبة'),
  compensationType,
  compensationValue: z.coerce.number().nonnegative('قيمة الأجر يجب ألا تكون سالبة'),
});

export const updateTeacherSchema = createTeacherSchema.partial();
