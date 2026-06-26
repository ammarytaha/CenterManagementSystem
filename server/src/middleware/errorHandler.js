// Central error handler — always returns a consistent JSON shape:
//   { error: { message, details? } }
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'حدث خطأ في الخادم';

  // Log server-side faults; client (4xx) errors are expected and stay quiet.
  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: {
      message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}
