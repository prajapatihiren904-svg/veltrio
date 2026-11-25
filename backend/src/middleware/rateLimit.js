import rateLimit from 'express-rate-limit';

const buildLimiter = ({ windowMinutes, limit, message }) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

// Applied to the whole API.
export const apiLimiter = buildLimiter({
  windowMinutes: 15,
  limit: 300,
  message: 'Too many requests. Please try again later.',
});

// Stricter limiter for login, register and forgot-password (wired in Phase 2).
export const authLimiter = buildLimiter({
  windowMinutes: 15,
  limit: 20,
  message: 'Too many attempts. Please try again in 15 minutes.',
});
