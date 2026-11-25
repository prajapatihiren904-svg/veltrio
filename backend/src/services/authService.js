import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';

import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

import {
  createSession,
  revokeCurrentSession,
  revokeAllSessions,
} from './sessionService.js';

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

export async function registerUser({ name, email, password }) {
  let user = await User.findOne({ email });

  if (user && user.emailVerified) {
    throw ApiError.conflict(
      'An account with this email already exists'
    );
  }

  if (user && user.emailVerificationLastSentAt) {
    const elapsed =
      Date.now() - user.emailVerificationLastSentAt.getTime();

    if (elapsed < 60000) {
      throw ApiError.badRequest(
        'Please wait before requesting another OTP'
      );
    }
  }

  const otp = generateOtp();

  const otpHash = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  if (!user) {
    user = new User({
      name,
      email,
      password,
      emailVerified: false,
    });
  } else {
    user.name = name;
    user.password = password;
    user.emailVerified = false;
  }

  user.emailVerificationCodeHash = otpHash;
  user.emailVerificationExpiresAt =
    new Date(Date.now() + 10 * 60 * 1000);

  user.emailVerificationAttempts = 0;
  user.emailVerificationLastSentAt = new Date();

  await user.save();

  try {
    await sendVerificationEmail(user.email, otp);
  } catch (error) {
    console.error('Verification email failed:', error.message);

    throw ApiError.badRequest(
      'Could not send verification email. Please try again.'
    );
  }

  return {
    requiresEmailVerification: true,
    email: user.email,
  };
}

export async function verifyEmail({ email, otp }, req) {
  const user = await User.findOne({ email }).select(
    '+emailVerificationCodeHash +emailVerificationExpiresAt'
  );

  if (!user) {
    throw ApiError.badRequest('Invalid verification request');
  }

  if (user.emailVerified) {
    throw ApiError.badRequest('Email is already verified');
  }

  if (
    !user.emailVerificationCodeHash ||
    !user.emailVerificationExpiresAt ||
    user.emailVerificationExpiresAt <= new Date()
  ) {
    throw ApiError.badRequest(
      'OTP expired. Please request a new OTP.'
    );
  }

  if (user.emailVerificationAttempts >= 5) {
    throw ApiError.badRequest(
      'Too many incorrect attempts. Request a new OTP.'
    );
  }

  const otpHash = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  if (otpHash !== user.emailVerificationCodeHash) {
    user.emailVerificationAttempts += 1;
    await user.save();

    throw ApiError.badRequest('Incorrect verification code');
  }

  user.emailVerified = true;
  user.emailVerificationCodeHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  user.emailVerificationAttempts = 0;

  await user.save();

  const session = await createSession(user, req);

  return {
    user: publicUser(user),
    token: session.token,
  };
}

export async function resendVerificationOtp(email) {
  const user = await User.findOne({ email });

  if (!user) {
    throw ApiError.badRequest(
      'Unable to process verification request'
    );
  }

  if (user.emailVerified) {
    throw ApiError.badRequest('Email is already verified');
  }

  if (user.emailVerificationLastSentAt) {
    const elapsed =
      Date.now() - user.emailVerificationLastSentAt.getTime();

    if (elapsed < 60000) {
      throw ApiError.badRequest(
        'Please wait 60 seconds before requesting another OTP'
      );
    }
  }

  const otp = generateOtp();

  user.emailVerificationCodeHash = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  user.emailVerificationExpiresAt =
    new Date(Date.now() + 10 * 60 * 1000);

  user.emailVerificationAttempts = 0;
  user.emailVerificationLastSentAt = new Date();

  await user.save();

  await sendVerificationEmail(user.email, otp);

  return {
    message: 'A new verification code has been sent',
  };
}

export async function loginUser({ email, password }, req) {
  const user = await User.findOne({ email }).select('+password');

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

  if (!user.emailVerified) {
    throw ApiError.forbidden(
      'Please verify your email before signing in'
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

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.unauthorized(
      'This session is no longer valid'
    );
  }

  return publicUser(user);
}

export async function logoutUser(sessionId) {
  await revokeCurrentSession(sessionId);
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email });

  if (!user || user.status !== 'active') return;

  await PasswordResetToken.deleteMany({ user: user.id });

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

  // Revoke every active session after a password reset.
  await revokeAllSessions(user.id);
}

async function sendVerificationEmail(email, otp) {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    throw ApiError.badRequest(
      'Email service is not configured'
    );
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  await transporter.sendMail({
    from: env.emailFrom,
    to: email,
    subject: 'Verify your VELTRIO account',

    text: `Your VELTRIO verification code is ${otp}. It expires in 10 minutes.`,

    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:25px;background:#101815;color:white;border-radius:14px">
        <h2 style="color:#10b981">Welcome to VELTRIO</h2>
        <p>Your email verification code is:</p>
        <h1 style="letter-spacing:8px;color:#10b981">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not create this account, ignore this email.</p>
      </div>
    `,
  });
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function sendResetEmail(email, resetUrl) {
  if (!env.smtpHost) {
    console.info(
      `[VELTRIO development] Password reset link for ${email}: ${resetUrl}`
    );

    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  await transporter.sendMail({
    from: env.emailFrom,
    to: email,
    subject: 'Reset your VELTRIO password',

    text: `Use this link to reset your password. It expires in 15 minutes: ${resetUrl}`,

    html: `
      <p>Use the link below to reset your VELTRIO password.</p>
      <p>This link expires in 15 minutes.</p>
      <p><a href="${resetUrl}">Reset password</a></p>
    `,
  });
}