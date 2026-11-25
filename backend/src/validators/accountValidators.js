import { body } from 'express-validator';

const supportedCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY'];

export const updateProfileRules = [
  body('name').isString().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2 to 80 characters'),
];

export const updatePreferencesRules = [
  body('currency').isIn(supportedCurrencies).withMessage('Choose a supported currency'),
];

export const deleteAccountRules = [
  body('password').isString().notEmpty().withMessage('Password is required'),
];

export const changePasswordRules = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  body('newPassword').isString().isLength({ min: 8, max: 72 })
    .custom((value) => Buffer.byteLength(value, 'utf8') <= 72)
    .withMessage('New password must be 8 to 72 characters'),
];
