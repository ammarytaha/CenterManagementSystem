import { z } from 'zod';
import { isValidMonthKey } from '../utils/months.js';

// Route params named ":id".
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('معرّف غير صالح'),
});

export const monthQuerySchema = z.object({
  month: z
    .string()
    .refine(isValidMonthKey, 'صيغة الشهر يجب أن تكون YYYY-MM')
    .optional(),
});

export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'صيغة التاريخ يجب أن تكون YYYY-MM-DD');

export const monthString = z
  .string()
  .refine(isValidMonthKey, 'صيغة الشهر يجب أن تكون YYYY-MM');
