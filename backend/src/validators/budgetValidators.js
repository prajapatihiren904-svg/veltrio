import { body, param, query } from 'express-validator';

const monthRule = (value) =>
    typeof value === 'string' &&
    /^[0-9]{4}-(0[1-9]|1[0-2])$/.test(value.trim());export const listBudgetRules = [
  query('month').optional().custom(monthRule).withMessage('Month must use YYYY-MM format'),
];
export const upsertBudgetRules = [
  body('month').custom(monthRule).withMessage('Month must use YYYY-MM format'),
  body('category').trim().isLength({ min: 2, max: 40 }).withMessage('Choose a valid category'),
  body('limit').isFloat({ gt: 0, max: 1000000000000 }).withMessage('Budget limit must be greater than zero'),
  body('alertThreshold').optional().isInt({ min: 1, max: 99 }).withMessage('Alert threshold must be 1–99'),
];
export const budgetIdRules = [param('id').isMongoId().withMessage('Invalid budget')];
