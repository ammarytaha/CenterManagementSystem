import { Router } from 'express';
import * as ctrl from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import {
  attendanceListQuerySchema,
  markAttendanceSchema,
  attendanceReportQuerySchema,
} from '../validators/attendanceValidators.js';

const router = Router();
router.use(authenticate, requireRole('admin', 'staff'));

// Specific paths before the generic roster route.
router.get('/report', validate(attendanceReportQuerySchema, 'query'), ctrl.attendanceReport);
router.get('/flags', ctrl.attendanceFlags);
router.get('/', validate(attendanceListQuerySchema, 'query'), ctrl.getRoster);
router.post('/', validate(markAttendanceSchema), ctrl.markAttendance);

export default router;
