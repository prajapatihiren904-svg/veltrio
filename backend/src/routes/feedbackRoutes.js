import { Router } from 'express';

import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import {
  createFeedback,
  getMyFeedback,
} from '../controllers/feedbackController.js';

import {
  createFeedbackRules,
} from '../validators/feedbackValidators.js';

const router = Router();

// All feedback routes require authentication.
router.use(authenticate);

// Submit feedback
router.post(
  '/',
  createFeedbackRules,
  validateRequest,
  asyncHandler(createFeedback)
);

// Get logged-in user's feedback
router.get(
  '/mine',
  asyncHandler(getMyFeedback)
);

export default router;