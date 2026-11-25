import { getHealthStatus } from '../services/healthService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getHealth = (req, res) =>
  sendSuccess(res, { message: 'VELTRIO API is running', data: getHealthStatus() });
