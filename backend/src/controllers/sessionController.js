import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

import {
  listSessions,
  revokeSession,
  revokeOtherSessions,
  revokeAllSessions,
  revokeCurrentSession,
} from '../services/sessionService.js';

export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await listSessions(
    req.user.id,
    req.authSession._id
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Sessions retrieved successfully',
    data: { sessions },
  });
});

export const signOutSession = asyncHandler(async (req, res) => {
  await revokeSession(req.user.id, req.params.sessionId);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Device signed out successfully',
    data: null,
  });
});

export const signOutOtherSessions = asyncHandler(async (req, res) => {
  const count = await revokeOtherSessions(
    req.user.id,
    req.authSession._id
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Other devices signed out successfully',
    data: { revokedCount: count },
  });
});

export const signOutAllSessions = asyncHandler(async (req, res) => {
  const count = await revokeAllSessions(req.user.id);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'All devices signed out successfully',
    data: { revokedCount: count },
  });
});

export const signOutCurrentSession = asyncHandler(async (req, res) => {
  await revokeCurrentSession(req.authSession._id);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Current device signed out successfully',
    data: null,
  });
});