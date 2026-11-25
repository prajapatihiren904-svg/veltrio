import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export function validateRequest(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array({ onlyFirstError: true }).map(({ path, param, msg }) => ({
      field: path || param,
      message: msg,
    }));
    return next(ApiError.badRequest('Please correct the highlighted fields', errors));
  }
  return next();
}
