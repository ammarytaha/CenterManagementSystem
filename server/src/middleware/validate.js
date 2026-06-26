import { badRequest } from '../utils/httpError.js';

// Validates req[source] against a Zod schema and replaces it with the parsed
// (coerced) data. `source` is 'body' | 'query' | 'params'.
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(badRequest('بيانات غير صالحة', details));
  }
  // Express 4: req.body/query/params are all writable — store the parsed result.
  req[source] = result.data;
  next();
};
