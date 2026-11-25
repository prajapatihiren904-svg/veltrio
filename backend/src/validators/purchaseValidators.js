import { body, param } from 'express-validator';

const validDate = (value) => {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

export const createPurchaseRules = [
  body('productName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be 2–100 characters'),

  body('category')
    .optional()
    .isIn([
      'electronics',
      'home_appliances',
      'vehicle',
      'furniture',
      'clothing',
      'travel',
      'other',
    ])
    .withMessage('Invalid purchase category'),

  body('description')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 300 })
    .withMessage('Description is too long'),

  body('totalPrice')
    .isFloat({ gt: 0, max: 1000000000000 })
    .withMessage('Enter a valid purchase price'),

  body('initialPaidAmount')
    .isFloat({ min: 0, max: 1000000000000 })
    .withMessage('Enter a valid initial payment'),

  body('paymentFrequency')
    .isIn(['full', 'weekly', 'monthly', 'custom'])
    .withMessage('Invalid payment frequency'),

  body('installmentAmount')
    .optional()
    .isFloat({ gt: 0, max: 1000000000000 })
    .withMessage('Invalid installment amount'),

  body('customIntervalDays')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Custom interval must be between 1 and 365 days'),

  body('startDate')
    .custom(validDate)
    .withMessage('Choose a valid start date'),
];

export const updatePurchaseRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid purchase'),

  ...createPurchaseRules,
];

export const purchaseIdRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid purchase'),
];

export const purchasePaymentRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid purchase'),

  body('amount')
    .isFloat({ gt: 0, max: 1000000000000 })
    .withMessage('Payment amount must be greater than zero'),

  body('note')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 160 })
    .withMessage('Payment note is too long'),

  body('date')
    .optional()
    .custom(validDate)
    .withMessage('Choose a valid payment date'),
];