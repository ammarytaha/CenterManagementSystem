import { z } from 'zod';

const status = z.enum(['active', 'inactive']);

export const createStudentSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  phone: z.string().min(1, 'رقم الهاتف مطلوب'),
  address: z.string().optional().nullable(),
  parentName: z.string().optional().nullable(),
  parentPhone: z.string().optional().nullable(),
  // Assigning a group also enrolls the student (creates a subscription).
  groupId: z.coerce.number().int().positive().optional().nullable(),
  status: status.optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export const studentListQuerySchema = z.object({
  search: z.string().optional(),
  groupId: z.coerce.number().int().positive().optional(),
  status: status.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});
