import { Router } from 'express';
import * as ctrl from '../controllers/studentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/commonValidators.js';
import {
  createStudentSchema,
  updateStudentSchema,
  studentListQuerySchema,
  addSubscriptionSchema,
} from '../validators/studentValidators.js';

const router = Router();
router.use(authenticate, requireRole('admin', 'assistant'));

router.get('/', validate(studentListQuerySchema, 'query'), ctrl.listStudents);
router.post('/', validate(createStudentSchema), ctrl.createStudent);
router.get('/:id', validate(idParamSchema, 'params'), ctrl.getStudent);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateStudentSchema), ctrl.updateStudent);
router.patch('/:id/deactivate', validate(idParamSchema, 'params'), ctrl.deactivateStudent);
router.post('/:id/subscriptions', validate(idParamSchema, 'params'), validate(addSubscriptionSchema), ctrl.addSubscription);
router.delete('/:id/subscriptions/:subId', ctrl.removeSubscription);

export default router;
