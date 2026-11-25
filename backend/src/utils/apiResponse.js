/**
 * Standard success envelope: { success: true, message?, data }.
 * Failures use { success: false, message, errors? } and are produced by the error handler.
 */
export const sendSuccess = (res, { data = null, message, statusCode = 200 } = {}) =>
  res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    data,
  });
