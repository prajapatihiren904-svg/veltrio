import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';

import { authLimiter } from '../middleware/rateLimit.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validate.js';

import {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  verifyEmailRules,
  resendVerificationRules,
} from '../validators/authValidators.js';

import * as authController from '../controllers/authController.js';

import {
  getSessions,
  signOutSession,
  signOutOtherSessions,
  signOutAllSessions,
  signOutCurrentSession,
} from '../controllers/sessionController.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  registerRules,
  validateRequest,
  asyncHandler(authController.register)
);

router.post(
  '/login',
  authLimiter,
  loginRules,
  validateRequest,
  asyncHandler(authController.login)
);

router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordRules,
  validateRequest,
  asyncHandler(authController.forgotPassword)
);

router.post(
  '/reset-password/:token',
  authLimiter,
  resetPasswordRules,
  validateRequest,
  asyncHandler(authController.resetPassword)
);

router.get(
  '/me',
  authenticate,
  asyncHandler(authController.me)
);

router.post(
  '/logout',
  authenticate,
  asyncHandler(authController.logout)
);

router.post(
  '/verify-email',
  authLimiter,
  verifyEmailRules,
  validateRequest,
  asyncHandler(authController.verifyEmail)
);

router.post(
  '/resend-verification',
  authLimiter,
  resendVerificationRules,
  validateRequest,
  asyncHandler(authController.resendVerificationOtp)
);

// LOGIN SESSION MANAGEMENT

router.get(
  '/sessions',
  authenticate,
  asyncHandler(authController.getSessions)
);

router.delete(
  '/sessions/:sessionId',
  authenticate,
  asyncHandler(authController.revokeSession)
);

router.post(
  '/sessions/revoke-others',
  authenticate,
  asyncHandler(authController.revokeOtherSessions)
);

router.post(
  '/sessions/revoke-all',
  authenticate,
  asyncHandler(authController.revokeAllSessions)
);

router.get('/sessions', authenticate, getSessions);

router.delete('/sessions/others', authenticate, signOutOtherSessions);

router.delete('/sessions/current', authenticate, signOutCurrentSession);

router.delete('/sessions', authenticate, signOutAllSessions);

router.delete('/sessions/:sessionId', authenticate, signOutSession);



router.post('/sessions/revoke-others', authenticate, signOutOtherSessions);

router.post('/sessions/revoke-all', authenticate, signOutAllSessions);
export default router;