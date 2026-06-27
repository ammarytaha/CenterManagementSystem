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
router.use(authenticate);

// Teachers may mark/view attendance, scoped to their own groups in the controllers.
const ops = requireRole('admin', 'assistant', 'teacher');

// Specific paths before the generic roster route.
router.get('/report', ops, validate(attendanceReportQuerySchema, 'query'), ctrl.attendanceReport);
router.get('/flags', requireRole('admin', 'assistant'), ctrl.attendanceFlags);
router.get('/', ops, validate(attendanceListQuerySchema, 'query'), ctrl.getRoster);
router.post('/', ops, validate(markAttendanceSchema), ctrl.markAttendance);

export default router;
