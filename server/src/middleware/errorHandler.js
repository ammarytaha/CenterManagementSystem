// Central error handler — always returns a consistent JSON shape:
//   { error: { message, details? } }
// Also translates the Prisma errors we expect into proper HTTP statuses so
// controllers can call prisma directly without pre-checking existence.
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'حدث خطأ في الخادم';
  let details = err.details;

  switch (err.code) {
    case 'P2025': // record not found (update/delete)
      status = 404;
      message = 'العنصر غير موجود';
      break;
    case 'P2002': // unique constraint
      status = 409;
      message = 'القيمة موجودة بالفعل';
      details = { fields: err.meta?.target };
      break;
    case 'P2003': // foreign key constraint
      status = 409;
      message = 'لا يمكن إتمام العملية لارتباط العنصر بسجلات أخرى';
      break;
    default:
      break;
  }

  // Log server-side faults; client (4xx) errors are expected and stay quiet.
  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: { message, ...(details ? { details } : {}) },
  });
}
