import { query, param, body } from 'express-validator';


export const adminUsersQueryRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search cannot exceed 100 characters'),

  query('status')
    .optional()
    .isIn(['active', 'suspended'])
    .withMessage('Invalid account status'),
];

export const adminUserIdRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

export const adminUserStatusRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),

  body('status')
    .isIn(['active', 'suspended'])
    .withMessage('Status must be active or suspended'),
];

// Validate feedback status update
export const adminFeedbackStatusRules = [
  body('status')
    .isIn(['new', 'in_progress', 'resolved'])
    .withMessage('Status must be new, in_progress or resolved'),
];

// Validate admin feedback response
export const adminFeedbackResponseRules = [
  body('response')
    .trim()
    .notEmpty()
    .withMessage('Response is required')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Response must be between 5 and 2000 characters'),
];