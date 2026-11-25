import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import { validateSession } from '../services/sessionService.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.get('authorization') || '';

  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Please sign in to continue');
  }

  const payload = jwt.verify(token, env.jwtSecret);

  const user = await User.findById(payload.sub);

  if (!user) {
    throw ApiError.unauthorized('This session is no longer valid');
  }

  if (user.status !== 'active') {
    throw ApiError.forbidden('This account has been suspended');
  }

  const session = await validateSession(
    user.id,
    payload.sid,
    token
  );

  req.user = user;
  req.authSession = session;
  req.authToken = token;

  next();
});