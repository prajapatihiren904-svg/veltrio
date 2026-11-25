import { body, param, query } from 'express-validator';

const validType = (value) => ['income', 'expense'].includes(value);
const validPaymentMethod = (value) => ['cash', 'upi', 'card', 'bank_transfer', 'other'].includes(value);

export const listTransactionRules = [
  query('type').optional().custom(validType).withMessage('Type must be income or expense'),
  query('category').optional().isMongoId().withMessage('Invalid category'),
  query('from').optional().isISO8601({ strict: true }).withMessage('Start date must be YYYY-MM-DD'),
  query('to').optional().isISO8601({ strict: true }).withMessage('End date must be YYYY-MM-DD'),
  query('search').optional().isString().isLength({ max: 100 }).withMessage('Search must be 100 characters or fewer'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

export const createTransactionRules = [
  body('type').custom(validType).withMessage('Choose income or expense'),
  body('amount').isFloat({ gt: 0, max: 1_000_000_000_000 }).withMessage('Amount must be greater than zero'),
  body('category').isMongoId().withMessage('Choose a valid category'),
  body('description').trim().isLength({ min: 2, max: 120 }).withMessage('Description must be 2 to 120 characters'),
  body('date').isISO8601().withMessage('Enter a valid date'),
  body('paymentMethod').optional().custom(validPaymentMethod).withMessage('Choose a valid payment method'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes must be 500 characters or fewer'),
];

export const updateTransactionRules = [
  param('id').isMongoId().withMessage('Invalid transaction'),
  body('type').optional().custom(validType).withMessage('Type must be income or expense'),
  body('amount').optional().isFloat({ gt: 0, max: 1_000_000_000_000 }).withMessage('Amount must be greater than zero'),
  body('category').optional().isMongoId().withMessage('Choose a valid category'),
  body('description').optional().trim().isLength({ min: 2, max: 120 }).withMessage('Description must be 2 to 120 characters'),
  body('date').optional().isISO8601().withMessage('Enter a valid date'),
  body('paymentMethod').optional().custom(validPaymentMethod).withMessage('Choose a valid payment method'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes must be 500 characters or fewer'),
];

export const transactionIdRules = [param('id').isMongoId().withMessage('Invalid transaction')];
export const categoryRules = [
  body('name').trim().isLength({ min: 2, max: 40 }).withMessage('Category name must be 2 to 40 characters'),
  body('type').custom(validType).withMessage('Category type must be income or expense'),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a six-digit hex value'),
];
export const categoryQueryRules = [query('type').optional().custom(validType).withMessage('Type must be income or expense')];

export const importTransactionRules = [
  body('transactions').isArray({ min: 1, max: 500 }).withMessage('Import between 1 and 500 rows'),
  body('transactions.*.type').isIn(['income', 'expense']).withMessage('Each row must be income or expense'),
  body('transactions.*.amount').isFloat({ gt: 0, max: 1_000_000_000_000 }).withMessage('Each amount must be greater than zero'),
  body('transactions.*.description').optional({ values: 'falsy' }).isString().trim().isLength({ min: 2, max: 120 }).withMessage('Description must be 2 to 120 characters when provided'),
  body('transactions.*.date').isISO8601().withMessage('Each row must have a valid date'),
  body('transactions.*.category').optional({ nullable: true }).isString().isLength({ max: 40 }),
];
