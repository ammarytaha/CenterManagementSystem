import { z } from 'zod';
import { dateString, monthString } from './commonValidators.js';

const method = z.enum(['vodafone_cash', 'instapay', 'cash'], {
  errorMap: () => ({ message: 'طريقة الدفع غير صالحة' }),
});

export const createPaymentSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
  month: monthString,
  method,
  reference: z.string().optional().nullable(),
});

export const paymentListQuerySchema = z.object({
  studentId: z.coerce.number().int().positive().optional(),
  method: method.optional(),
  month: monthString.optional(),
  from: dateString.optional(),
  to: dateString.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const updatePaymentSchema = z
  .object({
    amount: z.coerce.number().positive('المبلغ يجب أن يكون أكبر من صفر').optional(),
    month: monthString.optional(),
    method: method.optional(),
    reference: z.string().nullable().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'لا توجد حقول للتعديل' });
