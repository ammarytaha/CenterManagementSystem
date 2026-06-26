import { Router } from 'express';
import * as ctrl from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/commonValidators.js';
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from '../validators/userValidators.js';

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/', ctrl.listUsers);
router.post('/', validate(createUserSchema), ctrl.createUser);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateUserSchema), ctrl.updateUser);
router.patch(
  '/:id/password',
  validate(idParamSchema, 'params'),
  validate(resetPasswordSchema),
  ctrl.resetUserPassword
);
router.delete('/:id', validate(idParamSchema, 'params'), ctrl.deleteUser);

export default router;
