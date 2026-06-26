import { asyncHandler } from '../utils/asyncHandler.js';
import { getDashboardStats } from '../services/dashboardService.js';

// GET /api/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  res.json(await getDashboardStats());
});
