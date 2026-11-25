import { sendSuccess } from '../utils/apiResponse.js';
import { getDashboardSummary } from '../services/dashboardService.js';

export async function getSummary(req, res) {
  const summary = await getDashboardSummary(req.user.id, req.user.currency || 'INR');
  return sendSuccess(res, { data: { summary } });
}
