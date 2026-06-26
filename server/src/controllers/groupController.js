import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest } from '../utils/httpError.js';

// GET /api/groups
export const listGroups = asyncHandler(async (req, res) => {
  const groups = await prisma.group.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      teacher: { select: { id: true, name: true } },
      _count: { select: { subscriptions: true } },
    },
  });
  res.json({
    groups: groups.map(({ _count, ...g }) => ({ ...g, studentCount: _count.subscriptions })),
  });
});

// POST /api/groups
export const createGroup = asyncHandler(async (req, res) => {
  const group = await prisma.group.create({ data: req.body });
  res.status(201).json({ group });
});

// PUT /api/groups/:id
export const updateGroup = asyncHandler(async (req, res) => {
  const group = await prisma.group.update({ where: { id: req.params.id }, data: req.body });
  res.json({ group });
});

// GET /api/groups/:id  (detail: enrolled students + schedule)
export const getGroup = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      teacher: { select: { id: true, name: true, subject: true } },
      subscriptions: {
        where: { status: 'active' },
        include: { student: { select: { id: true, name: true, phone: true, status: true } } },
      },
    },
  });
  if (!group) throw badRequest('المجموعة غير موجودة');

  const { subscriptions, ...groupData } = group;
  const students = subscriptions.map((s) => ({
    ...s.student,
    subscriptionId: s.id,
    monthlyFee: s.monthlyFee,
  }));
  res.json({ group: groupData, students });
});
