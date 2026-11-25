import { ApiError } from '../utils/ApiError.js';

/** Turns any unmatched route into a 404 ApiError. */
export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

const isHttpErrorStatus = (value) => Number.isInteger(value) && value >= 400 && value <= 599;

/**
 * Maps any thrown value to { statusCode, message, errors }.
 * Exported separately so the mapping can be unit tested.
 */
export function normalizeError(err) {
  const libraryStatus = [err?.statusCode, err?.status].find(isHttpErrorStatus);
  let statusCode = libraryStatus || 500;
  let message = err?.message || 'Internal server error';
  let errors = err?.errors || null;

  // express.json(): malformed JSON / oversized body
  if (err?.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  } else if (err?.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large';
  }

  // Mongoose schema validation
  if (err?.name === 'ValidationError' && err.errors && !(err instanceof ApiError)) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  // Invalid ObjectId or wrong type for a field
  if (err?.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for "${err.path}"`;
  }

  // Duplicate key on a unique index (for example an email)
  if (err?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    message = `A record with this ${field} already exists`;
  }

  // JSON Web Token problems (used from Phase 2)
  if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  return { statusCode, message, errors };
}

/**
 * Builds the final Express error middleware.
 * In production, unexpected (non-operational) server errors never leak their message or stack.
 */
export function createErrorHandler({ isProduction = false, logger = console } = {}) {
  // Express identifies error middleware by its 4-argument signature.
  // eslint-disable-next-line no-unused-vars
  return function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    const { statusCode, message, errors } = normalizeError(err);
    if (statusCode >= 500) logger.error(err);

    const expose = !isProduction || statusCode < 500 || err?.isOperational === true;
    const body = {
      success: false,
      message: expose ? message : 'Internal server error',
    };
    if (errors && expose) body.errors = errors;
    if (!isProduction && statusCode >= 500) body.stack = err?.stack;

    return res.status(statusCode).json(body);
  };
}
