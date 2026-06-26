import { z } from 'zod';

const day = z.enum(['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'صيغة الوقت يجب أن تكون HH:mm');

export const createGroupSchema = z.object({
  name: z.string().min(1, 'اسم المجموعة مطلوب'),
  teacherId: z.coerce.number().int().positive('يجب اختيار مدرّس'),
  subject: z.string().min(1, 'المادة مطلوبة'),
  scheduleDays: z.array(day).min(1, 'اختر يومًا واحدًا على الأقل'),
  startTime: time,
  endTime: time,
  monthlyFee: z.coerce.number().nonnegative('الرسوم يجب ألا تكون سالبة'),
});

export const updateGroupSchema = createGroupSchema.partial();
