import { forbidden } from '../utils/httpError.js';

// Restricts a route to the given roles. Must run after `authenticate`.
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(forbidden('ليس لديك صلاحية للوصول إلى هذا المورد'));
  }
  next();
};
