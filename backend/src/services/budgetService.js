import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { ApiError } from '../utils/ApiError.js';
import { convertAmount } from './currencyService.js';

const round = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const monthBounds = (month) => {
  const [year, monthNumber] = month.split('-').map(Number);

  return {
    start: new Date(Date.UTC(year, monthNumber - 1, 1)),
    end: new Date(Date.UTC(year, monthNumber, 1)),
  };
};

export async function listBudgets(userId, month, currency = 'INR') {
  const selectedMonth =
    month || new Date().toISOString().slice(0, 7);

  const targetCurrency = String(currency || 'INR').toUpperCase();

  const { start, end } = monthBounds(selectedMonth);

  const budgets = await Budget.find({
    user: userId,
    month: selectedMonth,
  })
    .sort({ category: 1 })
    .lean();

  const expenses = await Transaction.find({
    user: userId,
    type: 'expense',
    date: { $gte: start, $lt: end },
  })
    .populate('category', 'name')
    .lean();

  // Convert each expense into the selected currency.
  const spentByCategory = new Map();

  for (const expense of expenses) {
    const categoryName = (
      expense.category?.name || 'Uncategorised'
    ).toLowerCase();

    const sourceCurrency = expense.currency || 'INR';

    const convertedAmount = await convertAmount(
      expense.amount,
      sourceCurrency,
      targetCurrency
    );

    spentByCategory.set(
      categoryName,
      round(
        (spentByCategory.get(categoryName) || 0) +
          convertedAmount
      )
    );
  }

  // Convert budget limits into the selected currency.
  const items = await Promise.all(
    budgets.map(async (budget) => {
      const originalCurrency = budget.currency || 'INR';

      const convertedLimit = await convertAmount(
        budget.limit,
        originalCurrency,
        targetCurrency
      );

      const categoryKey = budget.category.toLowerCase();

      const spent = round(
        spentByCategory.get(categoryKey) || 0
      );

      const limit = round(convertedLimit);

      const remaining = round(limit - spent);

      const percent =
        limit > 0 ? round((spent / limit) * 100) : 0;

      return {
        ...budget,

        originalLimit: budget.limit,
        originalCurrency,

        limit,
        spent,
        remaining,
        percent,

        currency: targetCurrency,

        status:
          percent >= 100
            ? 'exceeded'
            : percent >= (budget.alertThreshold || 80)
              ? 'warning'
              : 'on_track',
      };
    })
  );

  const totals = {
    limit: round(
      items.reduce((sum, item) => sum + item.limit, 0)
    ),

    spent: round(
      items.reduce((sum, item) => sum + item.spent, 0)
    ),

    remaining: round(
      items.reduce((sum, item) => sum + item.remaining, 0)
    ),
  };

  return {
    month: selectedMonth,
    currency: targetCurrency,
    items,
    totals,
  };
}

export async function upsertBudget(
  userId,
  payload,
  currency = 'INR'
) {
  const category = payload.category.trim();

  const selectedCurrency = String(currency || 'INR').toUpperCase();

  let budget = await Budget.findOne({
    user: userId,
    month: payload.month,
    category,
  });

  if (!budget) {
    const existing = await Budget.find({
      user: userId,
      month: payload.month,
    });

    budget =
      existing.find(
        (item) =>
          item.category.toLowerCase() ===
          category.toLowerCase()
      ) || null;
  }

  if (budget) {
    budget.limit = Number(payload.limit);
    budget.currency = selectedCurrency;
    budget.alertThreshold = payload.alertThreshold ?? 80;

    await budget.save();

    return budget;
  }

  return Budget.create({
    user: userId,
    month: payload.month,
    category,
    limit: Number(payload.limit),
    currency: selectedCurrency,
    alertThreshold: payload.alertThreshold ?? 80,
  });
}

export async function deleteBudget(userId, budgetId) {
  if (!mongoose.isValidObjectId(budgetId)) {
    throw ApiError.badRequest('Invalid budget');
  }

  const budget = await Budget.findOneAndDelete({
    _id: budgetId,
    user: userId,
  });

  if (!budget) {
    throw ApiError.notFound('Budget not found');
  }

  return { id: budget.id };
}