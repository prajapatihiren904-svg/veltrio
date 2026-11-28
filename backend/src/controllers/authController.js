import { sendSuccess } from '../utils/apiResponse.js';

import * as authService from '../services/authService.js';
import * as sessionService from '../services/sessionService.js';

export async function register(req, res) {
  const data = await authService.registerUser(req.body, req);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Account created and signed in successfully',
    data,
  });
}

export async function login(req, res) {
  const data = await authService.loginUser(req.body, req);

  return sendSuccess(res, {
    message: 'Signed in successfully',
    data,
  });
}

export async function me(req, res) {
  const user = await authService.getCurrentUser(req.user.id);

  return sendSuccess(res, {
    data: { user },
  });
}

export async function logout(req, res) {
  await authService.logoutUser(req.authSession.id);

  return sendSuccess(res, {
    message: 'Signed out successfully',
    data: null,
  });
}

export async function forgotPassword(req, res) {
  await authService.requestPasswordReset(req.body.email);

  return sendSuccess(res, {
    message: 'If an account exists for that email, a password reset link has been sent',
    data: null,
  });
}

export async function resetPassword(req, res) {
  await authService.resetPassword(
    req.params.token,
    req.body.password
  );

  return sendSuccess(res, {
    message: 'Password reset successfully. Please sign in.',
    data: null,
  });
}

export async function verifyEmail(req, res) {
  const data = await authService.verifyEmail(req.body, req);

  return sendSuccess(res, {
    message: 'Email verified successfully',
    data,
  });
}

export async function resendVerificationOtp(req, res) {
  const result = await authService.resendVerificationOtp(
    req.body.email
  );

  return sendSuccess(res, {
    message: result.message,
    data: null,
  });
}

export async function getSessions(req, res) {
  const sessions = await sessionService.listSessions(
    req.user.id,
    req.authSession.id
  );

  return sendSuccess(res, {
    message: 'Sessions retrieved successfully',
    data: { sessions },
  });
}

export async function revokeSession(req, res) {
  await sessionService.revokeSession(
    req.user.id,
    req.params.sessionId
  );

  return sendSuccess(res, {
    message: 'Device session revoked successfully',
    data: null,
  });
}

export async function revokeOtherSessions(req, res) {
  const count = await sessionService.revokeOtherSessions(
    req.user.id,
    req.authSession.id
  );

  return sendSuccess(res, {
    message: `${count} other session(s) revoked successfully`,
    data: { revokedCount: count },
  });
}

export async function revokeAllSessions(req, res) {
  const count = await sessionService.revokeAllSessions(
    req.user.id
  );

  return sendSuccess(res, {
    message: 'All sessions have been revoked',
    data: { revokedCount: count },
  });
}