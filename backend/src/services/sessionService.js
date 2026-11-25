import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

import UserSession from '../models/UserSession.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

function getTokenExpiry(token) {
  const decoded = jwt.decode(token);

  if (!decoded?.exp) {
    throw new Error('JWT expiration is missing');
  }

  return new Date(decoded.exp * 1000);
}

function getDeviceDetails(userAgent = '') {
  const ua = userAgent.toLowerCase();

  let browser = 'Unknown browser';

  if (ua.includes('edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('opr/')) browser = 'Opera';
  else if (ua.includes('chrome/')) browser = 'Google Chrome';
  else if (ua.includes('firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('safari/')) browser = 'Safari';

  let operatingSystem = 'Unknown OS';

  if (ua.includes('windows')) operatingSystem = 'Windows';
  else if (ua.includes('android')) operatingSystem = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) operatingSystem = 'iOS';
  else if (ua.includes('mac os')) operatingSystem = 'macOS';
  else if (ua.includes('linux')) operatingSystem = 'Linux';

  let device = 'Desktop';

  if (
    ua.includes('ipad') ||
    ua.includes('tablet')
  ) {
    device = 'Tablet';
  } else if (
    ua.includes('mobile') ||
    ua.includes('iphone') ||
    ua.includes('android')
  ) {
    device = 'Mobile';
  }

  return {
    browser,
    operatingSystem,
    device,
  };
}

export async function createSession(user, req) {
  const sessionId = crypto.randomUUID();

  const token = jwt.sign(
    {
      role: user.role,
      sid: sessionId,
    },
    env.jwtSecret,
    {
      subject: user.id,
      expiresIn: env.jwtExpiresIn,
    }
  );

  const userAgent = req.get('user-agent') || '';

  await UserSession.create({
    _id: sessionId,
    user: user.id,
    tokenHash: hashToken(token),
    ...getDeviceDetails(userAgent),
    userAgent,
    ipAddress: req.ip || '',
    lastActiveAt: new Date(),
    expiresAt: getTokenExpiry(token),
  });

  return {
    token,
    sessionId,
  };
}

export async function validateSession(userId, sessionId, token) {
  if (!sessionId) {
    throw ApiError.unauthorized('Please sign in again');
  }

  const session = await UserSession.findOne({
    _id: sessionId,
    user: userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).select('+tokenHash');

  if (!session || session.tokenHash !== hashToken(token)) {
    throw ApiError.unauthorized('This session is no longer valid');
  }

  const shouldUpdate =
    !session.lastActiveAt ||
    Date.now() - session.lastActiveAt.getTime() > 5 * 60 * 1000;

  if (shouldUpdate) {
    session.lastActiveAt = new Date();
    await session.save();
  }

  return session;
}

export async function listSessions(userId, currentSessionId) {
  const sessions = await UserSession.find({
    user: userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .select('-tokenHash -userAgent')
    .sort({ lastActiveAt: -1 })
    .lean();

  return sessions.map((session) => ({
    id: session._id,
    device: session.device,
    browser: session.browser,
    operatingSystem: session.operatingSystem,
    ipAddress: session.ipAddress,
    lastActiveAt: session.lastActiveAt,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    isCurrent: session._id === currentSessionId,
  }));
}

export async function revokeSession(userId, sessionId) {
  const session = await UserSession.findOneAndUpdate(
    {
      _id: sessionId,
      user: userId,
      revokedAt: null,
    },
    {
      $set: { revokedAt: new Date() },
    },
    { new: true }
  );

  if (!session) {
    throw ApiError.notFound('Session not found or already revoked');
  }
}

export async function revokeOtherSessions(userId, currentSessionId) {
  const result = await UserSession.updateMany(
    {
      user: userId,
      _id: { $ne: currentSessionId },
      revokedAt: null,
    },
    {
      $set: { revokedAt: new Date() },
    }
  );

  return result.modifiedCount;
}

export async function revokeAllSessions(userId) {
  const result = await UserSession.updateMany(
    {
      user: userId,
      revokedAt: null,
    },
    {
      $set: { revokedAt: new Date() },
    }
  );

  return result.modifiedCount;
}

export async function revokeCurrentSession(sessionId) {
  if (!sessionId) return;

  await UserSession.updateOne(
    {
      _id: sessionId,
      revokedAt: null,
    },
    {
      $set: { revokedAt: new Date() },
    }
  );
}