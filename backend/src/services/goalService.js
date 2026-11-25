import mongoose from 'mongoose';
import Goal from '../models/Goal.js';
import { ApiError } from '../utils/ApiError.js';
import { convertAmount, getExchangeRate } from './currencyService.js';

const todayUtc = () => new Date(new Date().toISOString().slice(0, 10));

const getCurrency = (currency) =>
  String(currency || 'INR').toUpperCase();

const deriveGoal = (goal) => {
  const savedAmount = Number(goal.savedAmount || 0);
  const targetAmount = Number(goal.targetAmount || 0);

  const percent =
    targetAmount > 0
      ? Number(((savedAmount / targetAmount) * 100).toFixed(1))
      : 0;

  const completed = savedAmount >= targetAmount;
  const overdue = !completed && new Date(goal.targetDate) < todayUtc();

  return {
    ...goal,
    savedAmount,
    remainingAmount: Number(
      Math.max(0, targetAmount - savedAmount).toFixed(2)
    ),
    percent,
    status: completed ? 'completed' : overdue ? 'overdue' : 'active',
  };
};

// Convert a goal into the user's selected display currency.
// Original amounts remain unchanged in MongoDB.

async function presentGoal(goal, targetCurrency) {
  const derived = deriveGoal(goal);

  const sourceCurrency = getCurrency(derived.currency);
  const target = getCurrency(targetCurrency);

  const rate = await getExchangeRate(sourceCurrency, target);

  const convertedContributions = await Promise.all(
    (derived.contributions || []).map(async (entry) => ({
      ...entry,
      originalAmount: entry.amount,
      originalCurrency: sourceCurrency,
      amount: await convertAmount(
        entry.amount,
        sourceCurrency,
        target
      ),
      currency: target,
    }))
  );

  return {
    ...derived,

    originalTargetAmount: derived.targetAmount,
    originalSavedAmount: derived.savedAmount,
    originalCurrency: sourceCurrency,

    targetAmount: await convertAmount(
      derived.targetAmount,
      sourceCurrency,
      target
    ),

    savedAmount: await convertAmount(
      derived.savedAmount,
      sourceCurrency,
      target
    ),

    remainingAmount: await convertAmount(
      derived.remainingAmount,
      sourceCurrency,
      target
    ),

    contributions: convertedContributions,

    currency: target,
    exchangeRate: rate,
  };
}

// ======================================
// LIST GOALS
// ======================================

export async function listGoals(userId, targetCurrency = 'INR') {
  const target = getCurrency(targetCurrency);

  const goals = await Goal.find({ user: userId })
    .sort({ targetDate: 1, createdAt: -1 })
    .lean();

  const items = await Promise.all(
    goals.map((goal) => presentGoal(goal, target))
  );

  return {
    items,

    totals: {
      targetAmount: Number(
        items.reduce((sum, item) => sum + item.targetAmount, 0).toFixed(2)
      ),

      savedAmount: Number(
        items.reduce((sum, item) => sum + item.savedAmount, 0).toFixed(2)
      ),

      remainingAmount: Number(
        items.reduce((sum, item) => sum + item.remainingAmount, 0).toFixed(2)
      ),

      completedCount: items.filter(
        (item) => item.status === 'completed'
      ).length,
    },

    currency: target,
  };
}

// ======================================
// CREATE GOAL
// ======================================

export async function createGoal(
  userId,
  payload,
  targetCurrency = 'INR'
) {
  const currency = getCurrency(targetCurrency);

  // Validate currency using the existing currency service.
  await getExchangeRate(currency, currency);

  const goal = await Goal.create({
    user: userId,
    name: payload.name,
    description: payload.description || '',
    targetAmount: Number(payload.targetAmount),
    savedAmount: 0,
    currency,
    targetDate: new Date(`${payload.targetDate}T00:00:00.000Z`),
  });

  return presentGoal(goal.toObject(), currency);
}

// ======================================
// UPDATE GOAL
// ======================================

export async function updateGoal(
  userId,
  goalId,
  payload,
  targetCurrency = 'INR'
) {
  if (!mongoose.isValidObjectId(goalId)) {
    throw ApiError.badRequest('Invalid goal');
  }

  const goal = await Goal.findOne({
    _id: goalId,
    user: userId,
  });

  if (!goal) {
    throw ApiError.notFound('Goal not found');
  }

  const displayCurrency = getCurrency(targetCurrency);
  const baseCurrency = getCurrency(goal.currency);

  // Convert the newly entered target back into the goal's stored currency.
  const targetAmount = await convertAmount(
    Number(payload.targetAmount),
    displayCurrency,
    baseCurrency
  );

  if (targetAmount < goal.savedAmount) {
    throw ApiError.badRequest(
      'Target amount cannot be lower than the amount already saved'
    );
  }

  goal.name = payload.name;
  goal.description = payload.description || '';
  goal.targetAmount = targetAmount;
  goal.targetDate = new Date(`${payload.targetDate}T00:00:00.000Z`);

  await goal.save();

  return presentGoal(goal.toObject(), displayCurrency);
}

// ======================================
// ADD CONTRIBUTION
// ======================================

export async function addContribution(
  userId,
  goalId,
  payload,
  targetCurrency = 'INR'
) {
  if (!mongoose.isValidObjectId(goalId)) {
    throw ApiError.badRequest('Invalid goal');
  }

  const goalRecord = await Goal.findOne({
    _id: goalId,
    user: userId,
  }).select('currency');

  if (!goalRecord) {
    throw ApiError.notFound('Goal not found');
  }

  const displayCurrency = getCurrency(targetCurrency);
  const baseCurrency = getCurrency(goalRecord.currency);

  // Convert the contribution into the goal's original currency.
  const amount = await convertAmount(
    Number(payload.amount),
    displayCurrency,
    baseCurrency
  );

  if (!Number.isFinite(amount) || amount <= 0) {
    throw ApiError.badRequest('Invalid contribution amount');
  }

  const contribution = {
    _id: new mongoose.Types.ObjectId(),
    amount,
    note: payload.note || '',
    date: payload.date
      ? new Date(`${payload.date}T00:00:00.000Z`)
      : new Date(),
  };

  // Atomic conditional update prevents concurrent contributions
  // from exceeding the target.
  const goal = await Goal.findOneAndUpdate(
    {
      _id: goalId,
      user: userId,
      $expr: {
        $lte: [
          { $add: ['$savedAmount', amount] },
          '$targetAmount',
        ],
      },
    },
    {
      $inc: { savedAmount: amount },
      $push: { contributions: contribution },
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (goal) {
    return presentGoal(goal, displayCurrency);
  }

  const ownedGoal = await Goal.exists({
    _id: goalId,
    user: userId,
  });

  if (!ownedGoal) {
    throw ApiError.notFound('Goal not found');
  }

  throw ApiError.badRequest(
    'This contribution exceeds the remaining amount for this goal'
  );
}

// ======================================
// DELETE GOAL
// ======================================

export async function deleteGoal(userId, goalId) {
  if (!mongoose.isValidObjectId(goalId)) {
    throw ApiError.badRequest('Invalid goal');
  }

  const goal = await Goal.findOneAndDelete({
    _id: goalId,
    user: userId,
  });

  if (!goal) {
    throw ApiError.notFound('Goal not found');
  }

  return { id: goal.id };
}