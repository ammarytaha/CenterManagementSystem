import { Router } from 'express';
import { login, me } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { loginSchema } from '../validators/authValidators.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, me);

export default router;
