import { body, param } from 'express-validator';

const validDate = (value) => {
if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const createGoalRules = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Goal name must be 2–60 characters'),
  body('description').optional({ values: 'null' }).trim().isLength({ max: 240 }).withMessage('Description is too long'),
  body('targetAmount').isFloat({ gt: 0, max: 1000000000000 }).withMessage('Target amount must be greater than zero'),
  body('targetDate').custom(validDate).withMessage('Choose a valid target date'),
];

export const updateGoalRules = [
  param('id').isMongoId().withMessage('Invalid goal'),
  ...createGoalRules,
];

export const goalIdRules = [param('id').isMongoId().withMessage('Invalid goal')];

export const contributionRules = [
  param('id').isMongoId().withMessage('Invalid goal'),
  body('amount').isFloat({ gt: 0, max: 1000000000000 }).withMessage('Contribution must be greater than zero'),
  body('note').optional({ values: 'null' }).trim().isLength({ max: 160 }).withMessage('Note is too long'),
  body('date').optional().custom(validDate).withMessage('Choose a valid contribution date'),
];
