import { Router } from 'express';
import * as ctrl from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/commonValidators.js';
import { createPaymentSchema, paymentListQuerySchema, updatePaymentSchema } from '../validators/paymentValidators.js';

const router = Router();
router.use(authenticate, requireRole('admin', 'assistant'));

router.post('/', validate(createPaymentSchema), ctrl.recordPayment);
// Specific paths before the generic list route.
router.get('/overdue', ctrl.overdue);
router.get('/student/:id/due', validate(idParamSchema, 'params'), ctrl.studentDue);
router.get('/:id/receipt', validate(idParamSchema, 'params'), ctrl.getReceipt);
router.get('/', validate(paymentListQuerySchema, 'query'), ctrl.listPayments);
router.put('/:id', requireRole('admin'), validate(idParamSchema, 'params'), validate(updatePaymentSchema), ctrl.updatePayment);
router.delete('/:id', requireRole('admin'), validate(idParamSchema, 'params'), ctrl.deletePayment);

export default router;
