import { asyncHandler } from '../utils/asyncHandler.js';
import { getRevenueReport, getAttendanceReport } from '../services/reportsService.js';
import { getAllTeacherEarnings } from '../services/earningsService.js';
import { currentMonthKey, isValidMonthKey } from '../utils/months.js';

const monthFrom = (req) => (isValidMonthKey(req.query.month) ? req.query.month : currentMonthKey());

// GET /api/reports/revenue?month=
export const revenueReport = asyncHandler(async (req, res) => {
  res.json(await getRevenueReport(monthFrom(req)));
});

// GET /api/reports/attendance?month=
export const attendanceSummary = asyncHandler(async (req, res) => {
  res.json(await getAttendanceReport(monthFrom(req)));
});

// GET /api/reports/teacher-earnings?month=
export const teacherEarningsReport = asyncHandler(async (req, res) => {
  res.json(await getAllTeacherEarnings(monthFrom(req)));
});
