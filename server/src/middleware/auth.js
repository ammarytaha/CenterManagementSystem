import { verifyToken } from '../utils/jwt.js';
import { unauthorized } from '../utils/httpError.js';

// Verifies the Bearer token and attaches the payload
// ({ id, role, name, email }) to req.user.
export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized('يجب تسجيل الدخول'));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(unauthorized('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى'));
  }
}
