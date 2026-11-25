import { body, param  } from 'express-validator';

export const registerRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2 to 80 characters'),
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').isString().isLength({ min: 8, max: 72 }).custom((value) => Buffer.byteLength(value, 'utf8') <= 72).withMessage('Password must be 8 to 72 characters and no more than 72 UTF-8 bytes'),
];

export const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

export const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
];

export const resetPasswordRules = [
  param('token').isString().isLength({ min: 32, max: 256 }).withMessage('Invalid reset link'),
  body('password').isString().isLength({ min: 8, max: 72 }).custom((value) => Buffer.byteLength(value, 'utf8') <= 72).withMessage('Password must be 8 to 72 characters and no more than 72 UTF-8 bytes'),
];

export const verifyEmailRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('otp')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Enter a valid 6-digit OTP'),
];

export const resendVerificationRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),
];