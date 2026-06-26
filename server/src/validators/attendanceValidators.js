import { z } from 'zod';
import { dateString } from './commonValidators.js';

const status = z.enum(['present', 'absent', 'late']);

export const attendanceListQuerySchema = z.object({
  groupId: z.coerce.number().int().positive('يجب اختيار مجموعة'),
  date: dateString,
});

export const markAttendanceSchema = z.object({
  groupId: z.coerce.number().int().positive(),
  date: dateString,
  records: z
    .array(
      z.object({
        studentId: z.coerce.number().int().positive(),
        status,
        note: z.string().optional().nullable(),
      })
    )
    .min(1, 'لا توجد سجلات حضور'),
});

export const attendanceReportQuerySchema = z.object({
  groupId: z.coerce.number().int().positive().optional(),
  studentId: z.coerce.number().int().positive().optional(),
});
