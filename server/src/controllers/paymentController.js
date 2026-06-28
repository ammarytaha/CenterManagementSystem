import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest, conflict, notFoundError } from '../utils/httpError.js';
import { getOverdueList, getStudentDueMonths, getStudentBalance } from '../services/overdueService.js';

const toDate = (d) => new Date(`${d}T00:00:00.000Z`);

// Receipt numbers: RCP-YYYYMM-#### (sequence within the current calendar month).
async function generateReceiptNumber(attempt = 0) {
  const now = new Date();
  const ym = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const count = await prisma.payment.count({ where: { receiptNumber: { startsWith: `RCP-${ym}-` } } });
  return `RCP-${ym}-${String(count + 1 + attempt).padStart(4, '0')}`;
}

// POST /api/payments  (manual record; money collected off-platform)
export const recordPayment = asyncHandler(async (req, res) => {
  const { studentId, amount, month, method, reference } = req.body;

  const student = await prisma.student.findUnique({ where: { id: studentId }, select: { id: true } });
  if (!student) throw badRequest('الطالب غير موجود');

  // Retry a few times in case two receipts race for the same sequence number.
  let payment = null;
  for (let i = 0; i < 5 && !payment; i += 1) {
    const receiptNumber = await generateReceiptNumber(i);
    try {
      payment = await prisma.payment.create({
        data: { studentId, amount, month, method, reference: reference ?? null, staffId: req.user.id, receiptNumber },
        include: {
          student: { select: { id: true, name: true } },
          staff: { select: { id: true, name: true } },
        },
      });
    } catch (e) {
      if (e.code === 'P2002') continue; // duplicate receiptNumber — retry
      throw e;
    }
  }
  if (!payment) throw conflict('تعذّر توليد رقم إيصال فريد، حاول مرة أخرى');

  res.status(201).json({ payment });
});

// GET /api/payments/overdue
export const overdue = asyncHandler(async (req, res) => {
  res.json(await getOverdueList());
});

// GET /api/payments/student/:id/due  (unpaid months for the record-payment flow)
export const studentDue = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const student = await prisma.student.findUnique({
    where: { id },
    select: { id: true, name: true, phone: true },
  });
  if (!student) throw badRequest('الطالب غير موجود');

  const due = await getStudentDueMonths(id, { onlyUnpaid: true });
  const balance = await getStudentBalance(id);
  res.json({ student, due, balance });
});

// GET /api/payments?studentId&method&month&from&to&page&pageSize
export const listPayments = asyncHandler(async (req, res) => {
  const { studentId, method, month, from, to, page, pageSize } = req.query;

  const where = {};
  if (studentId) where.studentId = studentId;
  if (method) where.method = method;
  if (month) where.month = month;
  if (from || to) {
    where.paidAt = {};
    if (from) where.paidAt.gte = toDate(from);
    if (to) {
      const t = toDate(to);
      t.setUTCDate(t.getUTCDate() + 1); // make `to` inclusive
      where.paidAt.lt = t;
    }
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { paidAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        student: { select: { id: true, name: true } },
        staff: { select: { id: true, name: true } },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  res.json({ payments, total, page, pageSize });
});

// GET /api/payments/:id/receipt
export const getReceipt = asyncHandler(async (req, res) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: {
      student: { select: { id: true, name: true, phone: true, parentName: true } },
      staff: { select: { id: true, name: true } },
    },
  });
  if (!payment) throw notFoundError('الإيصال غير موجود');
  res.json({ payment });
});

// PUT /api/payments/:id  (admin — correct a recorded payment)
export const updatePayment = asyncHandler(async (req, res) => {
  const data = {};
  for (const k of ['amount', 'month', 'method', 'reference']) {
    if (req.body[k] !== undefined) data[k] = req.body[k];
  }
  const payment = await prisma.payment.update({
    where: { id: req.params.id },
    data,
    include: {
      student: { select: { id: true, name: true } },
      staff: { select: { id: true, name: true } },
    },
  });
  res.json({ payment });
});

// DELETE /api/payments/:id  (admin — void a payment)
export const deletePayment = asyncHandler(async (req, res) => {
  await prisma.payment.delete({ where: { id: req.params.id } });
  res.json({ message: 'تم حذف الدفعة' });
});
