import { sendSuccess } from '../utils/apiResponse.js';
import * as budgetService from '../services/budgetService.js';

export async function listBudgets(req, res) {
  const currency =
    req.user.currency ||
    req.user.preferences?.currency ||
    'INR';

  const data = await budgetService.listBudgets(
    req.user.id,
    req.query.month,
    currency
  );

  return sendSuccess(res, { data });
}

export async function upsertBudget(req, res) {
  const currency =
    req.user.currency ||
    req.user.preferences?.currency ||
    'INR';

  const budget = await budgetService.upsertBudget(
    req.user.id,
    req.body,
    currency
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Budget saved successfully',
    data: { budget },
  });
}

export async function deleteBudget(req, res) {
  return sendSuccess(res, {
    message: 'Budget deleted successfully',
    data: await budgetService.deleteBudget(
      req.user.id,
      req.params.id
    ),
  });
}