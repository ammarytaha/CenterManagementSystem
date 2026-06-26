import { Router } from 'express';
import * as ctrl from '../controllers/groupController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/commonValidators.js';
import { createGroupSchema, updateGroupSchema } from '../validators/groupValidators.js';

const router = Router();
router.use(authenticate, requireRole('admin', 'staff'));

router.get('/', ctrl.listGroups);
router.post('/', validate(createGroupSchema), ctrl.createGroup);
router.get('/:id', validate(idParamSchema, 'params'), ctrl.getGroup);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateGroupSchema), ctrl.updateGroup);

export default router;
