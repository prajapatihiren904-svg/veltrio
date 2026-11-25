import mongoose from 'mongoose';
import Feedback from '../models/Feedback.js';
import { ApiError } from '../utils/ApiError.js';

// Create feedback for logged-in user
export async function createUserFeedback(userId, payload) {
  if (!mongoose.isValidObjectId(userId)) {
    throw ApiError.unauthorized('Invalid user session');
  }

  const feedback = await Feedback.create({
    user: userId,
    type: payload.type,
    subject: payload.subject,
    description: payload.description,
    rating: payload.rating,
  });

  return feedback.toObject();
}

// Get feedback submitted by logged-in user
export async function getUserFeedback(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw ApiError.unauthorized('Invalid user session');
  }

  return Feedback.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();
}