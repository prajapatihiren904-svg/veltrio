import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import { convertAmount } from './currencyService.js';

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

function buildMonthSlots(now, count = 6) {
  const slots = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1)
    );

    slots.push({
      key: `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1
      ).padStart(2, '0')}`,
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      label: new Intl.DateTimeFormat('en', {
        month: 'short',
        timeZone: 'UTC',
      }).format(date),
      income: 0,
      expense: 0,
    });
  }

  return slots;
}

/**
 * Convert grouped database totals into the selected currency.
 * Original transaction amounts in MongoDB are never modified.
 */
async function convertGroupedRows(rows, targetCurrency) {
  const convertedRows = await Promise.all(
    rows.map(async (row) => {
      const sourceCurrency = row._id.currency || 'INR';

      const convertedTotal = await convertAmount(
        row.total,
        sourceCurrency,
        targetCurrency
      );

      return {
        ...row,
        total: roundMoney(convertedTotal),
      };
    })
  );

  return convertedRows;
}

/** All calculations are scoped to the authenticated user's ID. */
export async function getDashboardSummary(
  userId,
  currency = 'INR',
  now = new Date()
) {
  const ownerId = new mongoose.Types.ObjectId(userId);
  const targetCurrency = String(currency || 'INR').toUpperCase();

  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );

  const sixMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)
  );

  const [
    allTimeRows,
    currentMonthRows,
    monthlyRows,
    categoryRows,
    recentTransactions,
  ] = await Promise.all([
    // All-time income and expenses grouped by original currency.
    Transaction.aggregate([
      { $match: { user: ownerId } },
      {
        $group: {
          _id: {
            type: '$type',
            currency: '$currency',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),

    // Current month totals grouped by original currency.
    Transaction.aggregate([
      {
        $match: {
          user: ownerId,
          date: { $gte: currentMonthStart, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            type: '$type',
            currency: '$currency',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),

    // Monthly trend grouped by month, type and original currency.
    Transaction.aggregate([
      {
        $match: {
          user: ownerId,
          date: { $gte: sixMonthStart, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
            currency: '$currency',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Current month expense categories grouped by original currency.
    Transaction.aggregate([
      {
        $match: {
          user: ownerId,
          type: 'expense',
          date: { $gte: currentMonthStart, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            category: '$category',
            currency: '$currency',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]),

    // Latest transactions.
    Transaction.find({ user: ownerId })
      .sort({ date: -1, createdAt: -1 })
      .limit(6)
      .populate({ path: 'category', select: 'name color type' })
      .lean(),
  ]);

  // Convert totals into the user's selected currency.
  const [
    convertedAllTimeRows,
    convertedCurrentMonthRows,
    convertedMonthlyRows,
    convertedCategoryRows,
  ] = await Promise.all([
    convertGroupedRows(allTimeRows, targetCurrency),
    convertGroupedRows(currentMonthRows, targetCurrency),
    convertGroupedRows(monthlyRows, targetCurrency),
    convertGroupedRows(categoryRows, targetCurrency),
  ]);

  // Calculate totals after conversion.
  const totalFor = (rows, type) =>
    rows
      .filter((row) => row._id.type === type)
      .reduce((sum, row) => sum + Number(row.total || 0), 0);

  const countFor = (rows, type) =>
    rows
      .filter((row) => row._id.type === type)
      .reduce((sum, row) => sum + Number(row.count || 0), 0);

  const totalIncome = roundMoney(
    totalFor(convertedAllTimeRows, 'income')
  );

  const totalExpenses = roundMoney(
    totalFor(convertedAllTimeRows, 'expense')
  );

  const monthIncome = roundMoney(
    totalFor(convertedCurrentMonthRows, 'income')
  );

  const monthExpenses = roundMoney(
    totalFor(convertedCurrentMonthRows, 'expense')
  );

  // Build monthly trend.
  const monthlyTrend = buildMonthSlots(now);
  const slotByKey = new Map(
    monthlyTrend.map((slot) => [slot.key, slot])
  );

  for (const row of convertedMonthlyRows) {
    const key = `${row._id.year}-${String(row._id.month).padStart(
      2,
      '0'
    )}`;

    const slot = slotByKey.get(key);

    if (slot && (row._id.type === 'income' || row._id.type === 'expense')) {
      slot[row._id.type] = roundMoney(
        slot[row._id.type] + Number(row.total || 0)
      );
    }
  }

  // Combine category totals after currency conversion.
  const categoryTotals = new Map();

  for (const row of convertedCategoryRows) {
    const categoryId = String(row._id.category);

    categoryTotals.set(
      categoryId,
      (categoryTotals.get(categoryId) || 0) + Number(row.total || 0)
    );
  }

  const sortedCategoryTotals = [...categoryTotals.entries()]
    .map(([categoryId, total]) => ({
      categoryId,
      total: roundMoney(total),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const categories = sortedCategoryTotals.length
    ? await Category.find({
        _id: {
          $in: sortedCategoryTotals.map((row) => row.categoryId),
        },
        user: ownerId,
      })
        .select('name color')
        .lean()
    : [];

  const categoryById = new Map(
    categories.map((category) => [String(category._id), category])
  );

  const expenseBreakdown = sortedCategoryTotals.map((row) => {
    const category = categoryById.get(row.categoryId);

    return {
      categoryId: row.categoryId,
      name: category?.name || 'Uncategorised',
      color: category?.color || '#64748B',
      amount: roundMoney(row.total),
      percentage:
        monthExpenses > 0
          ? roundMoney((row.total / monthExpenses) * 100)
          : 0,
    };
  });

  // Convert recent transaction amounts for display.
  const convertedRecentTransactions = await Promise.all(
    recentTransactions.map(async (transaction) => {
      const originalCurrency = transaction.currency || 'INR';

      const convertedAmount = await convertAmount(
        transaction.amount,
        originalCurrency,
        targetCurrency
      );

      return {
        ...transaction,
        originalAmount: transaction.amount,
        originalCurrency,
        amount: roundMoney(convertedAmount),
        currency: targetCurrency,
      };
    })
  );

  return {
    currency: targetCurrency,

    totals: {
      income: totalIncome,
      expenses: totalExpenses,
      balance: roundMoney(totalIncome - totalExpenses),
      incomeCount: countFor(allTimeRows, 'income'),
      expenseCount: countFor(allTimeRows, 'expense'),
      transactionCount: allTimeRows.reduce(
        (sum, row) => sum + Number(row.count || 0),
        0
      ),
    },

    currentMonth: {
      income: monthIncome,
      expenses: monthExpenses,
      net: roundMoney(monthIncome - monthExpenses),
      startDate: currentMonthStart.toISOString(),
    },

    monthlyTrend,
    expenseBreakdown,
    recentTransactions: convertedRecentTransactions,
    generatedAt: now.toISOString(),
  };
}