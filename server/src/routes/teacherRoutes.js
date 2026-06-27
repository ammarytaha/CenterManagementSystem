import { Router } from 'express';
import * as ctrl from '../controllers/teacherController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/commonValidators.js';
import { createTeacherSchema, updateTeacherSchema } from '../validators/teacherValidators.js';

const router = Router();
router.use(authenticate);

const manage = requireRole('admin', 'assistant');

// A teacher's own profile + groups + earnings.
router.get('/me', requireRole('teacher'), ctrl.getMyProfile);

router.get('/', manage, ctrl.listTeachers);
router.post('/', manage, validate(createTeacherSchema), ctrl.createTeacher);
router.get('/:id', manage, validate(idParamSchema, 'params'), ctrl.getTeacher);
router.put('/:id', manage, validate(idParamSchema, 'params'), validate(updateTeacherSchema), ctrl.updateTeacher);

export default router;
