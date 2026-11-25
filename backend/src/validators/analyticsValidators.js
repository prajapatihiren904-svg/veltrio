import { query } from 'express-validator';

export const analyticsQueryRules = [
  query('month')
    .optional()
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
    .withMessage('Month must use YYYY-MM format'),
];