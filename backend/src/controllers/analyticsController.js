import { sendSuccess } from '../utils/apiResponse.js';
import { getAnalytics } from '../services/analyticsService.js';

export async function getReport(req, res) {
  const report = await getAnalytics(req.user.id, req.query.month, req.user.currency || 'INR');
  return sendSuccess(res, { data: { report } });
}
