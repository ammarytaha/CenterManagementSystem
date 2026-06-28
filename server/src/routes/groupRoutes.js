import { Router } from 'express';
import * as ctrl from '../controllers/groupController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/commonValidators.js';
import { createGroupSchema, updateGroupSchema } from '../validators/groupValidators.js';

const router = Router();
router.use(authenticate);

const manage = requireRole('admin', 'assistant');
// Teachers may view, but the controller scopes results to their own groups.
const view = requireRole('admin', 'assistant', 'teacher');

router.get('/', view, ctrl.listGroups);
router.post('/', manage, validate(createGroupSchema), ctrl.createGroup);
router.get('/:id', view, validate(idParamSchema, 'params'), ctrl.getGroup);
router.put('/:id', manage, validate(idParamSchema, 'params'), validate(updateGroupSchema), ctrl.updateGroup);
router.delete('/:id', requireRole('admin'), validate(idParamSchema, 'params'), ctrl.deleteGroup);

export default router;
