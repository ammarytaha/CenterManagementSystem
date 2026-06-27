import { Router } from 'express';
import * as ctrl from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();
router.use(authenticate, requireRole('admin', 'assistant'));

router.get('/revenue', ctrl.revenueReport);
router.get('/attendance', ctrl.attendanceSummary);
router.get('/teacher-earnings', ctrl.teacherEarningsReport);

export default router;
