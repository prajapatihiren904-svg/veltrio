import { sendSuccess } from '../utils/apiResponse.js';


import {
  getAdminFeedback,
  getAdminFeedbackStats,
  updateAdminFeedbackStatus,
  respondToFeedback,
} from '../services/adminService.js';

// Get all feedback
export async function getFeedback(req, res) {
  const result = await getAdminFeedback(req.query);

  return sendSuccess(res, {
    data: result,
  });
}

// Get feedback statistics
export async function getFeedbackStats(req, res) {
  const stats = await getAdminFeedbackStats();

  return sendSuccess(res, {
    data: { stats },
  });
}

// Update feedback status
export async function updateFeedbackStatus(req, res) {
  const feedback = await updateAdminFeedbackStatus(
    req.params.id,
    req.body.status
  );

  return sendSuccess(res, {
    message: 'Feedback status updated successfully',
    data: { feedback },
  });
}

// Admin responds to user feedback
export async function replyToFeedback(req, res) {
  const feedback = await respondToFeedback(
    req.params.id,
    req.body.response,
    req.user.id
  );

  return sendSuccess(res, {
    message: 'Response submitted successfully',
    data: { feedback },
  });
}