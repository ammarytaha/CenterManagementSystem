import { Router } from 'express';
import * as ctrl from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();
router.use(authenticate, requireRole('admin', 'assistant'));

router.get('/', ctrl.getDashboard);

export default router;
