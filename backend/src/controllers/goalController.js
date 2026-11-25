import { sendSuccess } from '../utils/apiResponse.js';
import * as goalService from '../services/goalService.js';

const getUserCurrency = (req) =>
  req.user.currency || 'INR';

// ======================================
// LIST GOALS
// ======================================

export async function listGoals(req, res) {
  const data = await goalService.listGoals(
    req.user.id,
    getUserCurrency(req)
  );

  return sendSuccess(res, { data });
}

// ======================================
// CREATE GOAL
// ======================================

export async function createGoal(req, res) {
  const goal = await goalService.createGoal(
    req.user.id,
    req.body,
    getUserCurrency(req)
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Savings goal created',
    data: { goal },
  });
}

// ======================================
// UPDATE GOAL
// ======================================

export async function updateGoal(req, res) {
  const goal = await goalService.updateGoal(
    req.user.id,
    req.params.id,
    req.body,
    getUserCurrency(req)
  );

  return sendSuccess(res, {
    message: 'Savings goal updated',
    data: { goal },
  });
}

// ======================================
// ADD CONTRIBUTION
// ======================================

export async function addContribution(req, res) {
  const goal = await goalService.addContribution(
    req.user.id,
    req.params.id,
    req.body,
    getUserCurrency(req)
  );

  return sendSuccess(res, {
    message: 'Contribution added',
    data: { goal },
  });
}

// ======================================
// DELETE GOAL
// ======================================

export async function deleteGoal(req, res) {
  return sendSuccess(res, {
    message: 'Savings goal deleted',
    data: await goalService.deleteGoal(
      req.user.id,
      req.params.id
    ),
  });
}