import { Router } from 'express';

import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import {
  getOverview,
  getUsers,
  getUser,
  updateUserStatus,
} from '../controllers/adminController.js';

import {
  adminUsersQueryRules,
  adminUserIdRules,
  adminUserStatusRules,
  adminFeedbackStatusRules,
  adminFeedbackResponseRules,
} from '../validators/adminValidators.js';

const router = Router();

import {
  getFeedback,
  getFeedbackStats,
  updateFeedbackStatus,
  replyToFeedback,
} from '../controllers/adminFeedbackController.js';
// All admin routes require authentication and admin authorization.
router.use(authenticate, authorize('admin'));

// Admin dashboard overview
router.get('/overview', asyncHandler(getOverview));

// Get all users
router.get(
  '/users',
  adminUsersQueryRules,
  validateRequest,
  asyncHandler(getUsers)
);

// Get single user
router.get(
  '/users/:id',
  adminUserIdRules,
  validateRequest,
  asyncHandler(getUser)
);

// Suspend or activate user
router.patch(
  '/users/:id/status',
  adminUserStatusRules,
  validateRequest,
  asyncHandler(updateUserStatus)
);
// Feedback Management

// Get feedback statistics
router.get(
  '/feedback/stats',
  asyncHandler(getFeedbackStats)
);

// Get all feedback with filters and pagination
router.get(
  '/feedback',
  asyncHandler(getFeedback)
);

// Update feedback status
router.patch(
  '/feedback/:id/status',
  adminFeedbackStatusRules,
  validateRequest,
  asyncHandler(updateFeedbackStatus)
);

// Admin responds to user feedback
router.patch(
  '/feedback/:id/response',
  adminFeedbackResponseRules,
  validateRequest,
  asyncHandler(replyToFeedback)
);
export default router;