// HTTP error with a status code + (Arabic) message. The error middleware reads
// `status` and `details` off these.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    if (details) this.details = details;
  }
}

export const badRequest = (message, details) => new HttpError(400, message, details);
export const unauthorized = (message = 'غير مصرح') => new HttpError(401, message);
export const forbidden = (message = 'ليس لديك صلاحية') => new HttpError(403, message);
export const notFoundError = (message = 'العنصر غير موجود') => new HttpError(404, message);
export const conflict = (message) => new HttpError(409, message);
