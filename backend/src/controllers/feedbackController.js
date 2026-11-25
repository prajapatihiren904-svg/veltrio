import { sendSuccess } from '../utils/apiResponse.js';

import {
  createUserFeedback,
  getUserFeedback,
} from '../services/feedbackService.js';

// Submit feedback
export async function createFeedback(req, res) {
  const feedback = await createUserFeedback(
    req.user.id,
    req.body
  );

  return sendSuccess(res, {
    message: 'Feedback submitted successfully',
    data: { feedback },
    statusCode: 201,
  });
}

// Get logged-in user's feedback
export async function getMyFeedback(req, res) {
  const result = await getUserFeedback(req.user.id);

  return sendSuccess(res, {
    data: { feedback: result },
  });
}