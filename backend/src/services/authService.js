import crypto from 'node:crypto';
import { Resend } from 'resend';

import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';

import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

import {
  createSession,
  revokeCurrentSession,
  revokeAllSessions,
} from './sessionService.js';

// Public user information
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  currency: user.currency,
  avatarUrl: user.avatarUrl || '',
  createdAt: user.createdAt,
});

// ========================================
// REGISTER USER
// ========================================

export async function registerUser({ name, email, password }, req) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw ApiError.conflict(
      'An account with this email already exists'
    );
  }

  const user = new User({
    name: name.trim(),
    email: normalizedEmail,
    password,
    emailVerified: true,
  });

  await user.save();

  const session = await createSession(user, req);

  return {
    user: publicUser(user),
    token: session.token,
  };
}

// ========================================
// EMAIL VERIFICATION DISABLED
// ========================================

export async function verifyEmail() {
  throw ApiError.badRequest(
    'Email verification is disabled'
  );
}

export async function resendVerificationOtp() {
  throw ApiError.badRequest(
    'Email verification is disabled'
  );
}

// ========================================
// LOGIN USER
// ========================================

export async function loginUser({ email, password }, req) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized(
      'Email or password is incorrect'
    );
  }

  if (user.status !== 'active') {
    throw ApiError.forbidden(
      'This account has been suspended'
    );
  }

  user.lastLoginAt = new Date();

  await user.save();

  const session = await createSession(user, req);

  return {
    user: publicUser(user),
    token: session.token,
  };
}

// ========================================
// GET CURRENT USER
// ========================================

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.unauthorized(
      'This session is no longer valid'
    );
  }

  return publicUser(user);
}

// ========================================
// LOGOUT USER
// ========================================

export async function logoutUser(sessionId) {
  await revokeCurrentSession(sessionId);
}

// ========================================
// FORGOT PASSWORD
// ========================================

export async function requestPasswordReset(email) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user || user.status !== 'active') {
    return;
  }

  await PasswordResetToken.deleteMany({
    user: user.id,
  });

  const rawToken = crypto.randomBytes(32).toString('hex');

  const tokenHash = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  await PasswordResetToken.create({
    user: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  const resetUrl =
    `${env.clientOrigins[0]}/reset-password/${rawToken}`;

  try {
    await sendResetEmail(user.email, resetUrl);
  } catch (error) {
    await PasswordResetToken.deleteOne({ tokenHash });

    console.error(
      `Password reset email delivery failed: ${error.message}`
    );
  }
}

// ========================================
// RESET PASSWORD
// ========================================

export async function resetPassword(rawToken, password) {
  const tokenHash = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  const resetToken = await PasswordResetToken.findOne({
    tokenHash,
  }).select('+tokenHash');

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt <= new Date()
  ) {
    throw ApiError.badRequest(
      'This password reset link is invalid or has expired'
    );
  }

  const consumed = await PasswordResetToken.findOneAndUpdate(
    {
      _id: resetToken.id,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: { usedAt: new Date() },
    },
    { new: true }
  );

  if (!consumed) {
    throw ApiError.badRequest(
      'This password reset link is invalid or has expired'
    );
  }

  const user = await User.findById(
    resetToken.user
  ).select('+password');

  if (!user || user.status !== 'active') {
    throw ApiError.badRequest(
      'This password reset link is invalid or has expired'
    );
  }

  user.password = password;

  await user.save();

  await PasswordResetToken.deleteMany({
    user: user.id,
  });

  await revokeAllSessions(user.id);
}

// ========================================
// SEND PASSWORD RESET EMAIL
// ========================================

async function sendResetEmail(email, resetUrl) {
  if (!env.resendApiKey) {
    throw new Error(
      'RESEND_API_KEY is not configured'
    );
  }

  const resend = new Resend(env.resendApiKey);

  const { data, error } = await resend.emails.send({
    from: env.emailFrom,
    to: email,
    subject: 'Reset your VELTRIO password',

    text: `Use this link to reset your password. It expires in 15 minutes: ${resetUrl}`,

    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:25px;background:#101815;color:white;border-radius:14px">
        <h2 style="color:#10b981">VELTRIO</h2>

        <p>Use the link below to reset your password.</p>

        <p>This link expires in 15 minutes.</p>

        <a href="${resetUrl}" style="color:#10b981">
          Reset password
        </a>
      </div>
    `,
  });

  if (error) {
    throw new Error(
      `Resend password reset email failed: ${error.message}`
    );
  }

  return data;
}