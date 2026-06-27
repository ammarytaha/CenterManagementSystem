import { prisma } from '../config/prisma.js';
import { forbidden } from './httpError.js';

// The teacher-profile id linked to a given login (role=teacher), or null.
export async function teacherIdForUser(userId) {
  const t = await prisma.teacher.findUnique({ where: { userId }, select: { id: true } });
  return t?.id ?? null;
}

// Group ids owned by a teacher login (empty if not linked).
export async function teacherGroupIds(userId) {
  const tid = await teacherIdForUser(userId);
  if (!tid) return [];
  const groups = await prisma.group.findMany({ where: { teacherId: tid }, select: { id: true } });
  return groups.map((g) => g.id);
}

// Throws 403 if a teacher touches a group that isn't theirs. No-op for others.
export async function assertTeacherOwnsGroup(req, groupId) {
  if (req.user.role !== 'teacher') return;
  const tid = await teacherIdForUser(req.user.id);
  const group = await prisma.group.findUnique({ where: { id: groupId }, select: { teacherId: true } });
  if (!group || group.teacherId !== tid) {
    throw forbidden('لا تملك صلاحية الوصول لهذه المجموعة');
  }
}
