import { body } from 'express-validator';

const validFeedbackType = (value) =>
  ['suggestion', 'bug', 'feature'].includes(value);

export const createFeedbackRules = [
  body('type')
    .custom(validFeedbackType)
    .withMessage('Choose suggestion, bug report or feature request'),

  body('subject')
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('Subject must be 3 to 120 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be 10 to 2000 characters'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
];