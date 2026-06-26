import { Router } from 'express';
import * as ctrl from '../controllers/teacherController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/commonValidators.js';
import { createTeacherSchema, updateTeacherSchema } from '../validators/teacherValidators.js';

const router = Router();
router.use(authenticate, requireRole('admin', 'staff'));

router.get('/', ctrl.listTeachers);
router.post('/', validate(createTeacherSchema), ctrl.createTeacher);
router.get('/:id', validate(idParamSchema, 'params'), ctrl.getTeacher);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateTeacherSchema), ctrl.updateTeacher);

export default router;
