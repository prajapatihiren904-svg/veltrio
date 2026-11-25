import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import { convertAmount } from './currencyService.js';

const round = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const monthKey = (date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

const monthStart = (key) => {
  const [year, month] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
};

const addMonths = (date, count) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1));

function monthSlots(selectedMonth) {
  const selected = monthStart(selectedMonth);

  return Array.from({ length: 6 }, (_, index) => {
    const date = addMonths(selected, index - 5);

    return {
      key: monthKey(date),
      label: new Intl.DateTimeFormat('en', {
        month: 'short',
        timeZone: 'UTC',
      }).format(date),
      income: 0,
      expense: 0,
    };
  });
}

// Convert grouped amounts into selected currency.
async function convertGroupedRows(rows, targetCurrency, amountField = 'total') {
  return Promise.all(
    rows.map(async (row) => {
      const sourceCurrency = row._id.currency || 'INR';

      const convertedAmount = await convertAmount(
        row[amountField],
        sourceCurrency,
        targetCurrency
      );

      return {
        ...row,
        [amountField]: round(convertedAmount),
      };
    })
  );
}

/**
 * Returns authenticated-user analytics for one selected calendar month.
 */
export async function getAnalytics(userId, selectedMonth, currency = 'INR') {
  const ownerId = new mongoose.Types.ObjectId(userId);
  const targetCurrency = String(currency || 'INR').toUpperCase();
  const now = new Date();

  const month =
    /^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth || '')
      ? selectedMonth
      : monthKey(now);

  const start = monthStart(month);
  const end = addMonths(start, 1);
  const sixMonthStart = addMonths(start, -5);

  const daysInMonth = new Date(
    Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth() + 1,
      0
    )
  ).getUTCDate();

  const [
    monthlyRows,
    trendRows,
    categoryRows,
    allTimeRows,
    dailyRows,
    biggestExpenseRow,
  ] = await Promise.all([

    // MONTHLY TOTALS GROUPED BY CURRENCY

    Transaction.aggregate([
      {
        $match: {
          user: ownerId,
          date: { $gte: start, $lt: end },
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

    // SIX-MONTH CASH FLOW TREND

    Transaction.aggregate([
      {
        $match: {
          user: ownerId,
          date: { $gte: sixMonthStart, $lt: end },
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
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]),

    // CATEGORY-WISE EXPENSES

    Transaction.aggregate([
      {
        $match: {
          user: ownerId,
          type: 'expense',
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            category: '$category',
            currency: '$currency',
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),

    // ALL-TIME TOTALS

    Transaction.aggregate([
      {
        $match: { user: ownerId },
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

    // DAILY EXPENSE TREND

    Transaction.aggregate([
      {
        $match: {
          user: ownerId,
          type: 'expense',
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$date',
                timezone: 'UTC',
              },
            },
            currency: '$currency',
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]),

    // BIGGEST INDIVIDUAL EXPENSE

    Transaction.findOne({
      user: ownerId,
      type: 'expense',
      date: { $gte: start, $lt: end },
    })
      .sort({ amount: -1, date: -1 })
      .select('description amount date category currency')
      .lean(),

  ]);

  // CONVERT ALL GROUPED DATA

  const [
    convertedMonthlyRows,
    convertedTrendRows,
    convertedCategoryRows,
    convertedAllTimeRows,
    convertedDailyRows,
  ] = await Promise.all([
    convertGroupedRows(monthlyRows, targetCurrency),
    convertGroupedRows(trendRows, targetCurrency),
    convertGroupedRows(categoryRows, targetCurrency, 'amount'),
    convertGroupedRows(allTimeRows, targetCurrency),
    convertGroupedRows(dailyRows, targetCurrency, 'amount'),
  ]);

  // HELPER FUNCTIONS

  const total = (rows, type) =>
    round(
      rows
        .filter((row) => row._id.type === type)
        .reduce((sum, row) => sum + Number(row.total || 0), 0)
    );

  const count = (rows, type) =>
    rows
      .filter((row) => row._id.type === type)
      .reduce((sum, row) => sum + Number(row.count || 0), 0);

  // SELECTED MONTH TOTALS

  const income = total(convertedMonthlyRows, 'income');
  const expenses = total(convertedMonthlyRows, 'expense');

  // SIX-MONTH TREND

  const trend = monthSlots(month);

  const trendMap = new Map(
    trend.map((item) => [item.key, item])
  );

  convertedTrendRows.forEach((row) => {
    const key = `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;

    const slot = trendMap.get(key);

    if (slot && (row._id.type === 'income' || row._id.type === 'expense')) {
      slot[row._id.type] = round(
        slot[row._id.type] + Number(row.total || 0)
      );
    }
  });

  // CATEGORY BREAKDOWN

  const categoryTotals = new Map();

  convertedCategoryRows.forEach((row) => {
    const categoryId = String(row._id.category);

    const existing = categoryTotals.get(categoryId) || {
      amount: 0,
      count: 0,
    };

    existing.amount += Number(row.amount || 0);
    existing.count += Number(row.count || 0);

    categoryTotals.set(categoryId, existing);
  });

  const sortedCategoryRows = [...categoryTotals.entries()]
    .map(([categoryId, data]) => ({
      categoryId,
      amount: round(data.amount),
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  const categories = sortedCategoryRows.length
    ? await Category.find({
        _id: {
          $in: sortedCategoryRows.map((row) => row.categoryId),
        },
        user: ownerId,
        type: 'expense',
      })
        .select('name color')
        .lean()
    : [];

  const categoryMap = new Map(
    categories.map((item) => [String(item._id), item])
  );

  const breakdown = sortedCategoryRows.map((row) => {
    const category = categoryMap.get(row.categoryId);

    return {
      categoryId: row.categoryId,
      name: category?.name || 'Uncategorised',
      color: category?.color || '#64748B',
      amount: round(row.amount),
      count: row.count,
      percentage: expenses
        ? round((row.amount / expenses) * 100)
        : 0,
    };
  });

  // DAILY SPENDING DATA

  const dailyMap = new Map();

  convertedDailyRows.forEach((row) => {
    const key = row._id.date;

    const existing = dailyMap.get(key) || {
      amount: 0,
      count: 0,
    };

    existing.amount += Number(row.amount || 0);
    existing.count += Number(row.count || 0);

    dailyMap.set(key, existing);
  });

  const dailyTrend = Array.from(
    { length: daysInMonth },
    (_, index) => {
      const day = index + 1;

      const date = new Date(
        Date.UTC(
          start.getUTCFullYear(),
          start.getUTCMonth(),
          day
        )
      );

      const key = date.toISOString().slice(0, 10);

      const dailyData = dailyMap.get(key) || {
        amount: 0,
        count: 0,
      };

      return {
        date: key,
        day,
        amount: round(dailyData.amount),
        count: dailyData.count,
      };
    }
  );

  // HIGHEST AND LOWEST SPENDING DAYS

  const activeDays = dailyTrend.filter(
    (item) => item.count > 0
  );

  const highestSpendingDay = activeDays.length
    ? [...activeDays].sort(
        (a, b) => b.amount - a.amount
      )[0]
    : null;

  const lowestSpendingDay = activeDays.length
    ? [...activeDays].sort(
        (a, b) => a.amount - b.amount
      )[0]
    : null;

  // BIGGEST EXPENSE CATEGORY NAME

  const biggestExpenseCategory = biggestExpenseRow
    ? await Category.findOne({
        _id: biggestExpenseRow.category,
        user: ownerId,
        type: 'expense',
      })
        .select('name')
        .lean()
    : null;

  // CONVERT BIGGEST EXPENSE

  let biggestExpense = null;

  if (biggestExpenseRow) {
    const originalCurrency = biggestExpenseRow.currency || 'INR';

    const convertedAmount = await convertAmount(
      biggestExpenseRow.amount,
      originalCurrency,
      targetCurrency
    );

    biggestExpense = {
      description: biggestExpenseRow.description,
      amount: round(convertedAmount),
      date: biggestExpenseRow.date,
      category: biggestExpenseCategory?.name || 'Uncategorised',
    };
  }

  // PREVIOUS MONTH COMPARISON

  const previousMonth = monthKey(
    addMonths(start, -1)
  );

  const previousTrend = trendMap.get(previousMonth) || {
    income: 0,
    expense: 0,
  };

  const savingsRate =
    income > 0
      ? round(((income - expenses) / income) * 100)
      : 0;

  // ALL-TIME TOTALS

  const allIncome = total(convertedAllTimeRows, 'income');
  const allExpenses = total(convertedAllTimeRows, 'expense');

  // FINAL RESPONSE

  return {
    month,
    currency: targetCurrency,

    summary: {
      income,
      expenses,
      net: round(income - expenses),

      transactionCount: convertedMonthlyRows.reduce(
        (sum, row) => sum + Number(row.count || 0),
        0
      ),

      incomeCount: count(convertedMonthlyRows, 'income'),
      expenseCount: count(convertedMonthlyRows, 'expense'),
      savingsRate,
    },

    comparison: {
      previousMonth,

      incomeChange: previousTrend.income
        ? round(
            ((income - previousTrend.income) /
              previousTrend.income) * 100
          )
        : null,

      expenseChange: previousTrend.expense
        ? round(
            ((expenses - previousTrend.expense) /
              previousTrend.expense) * 100
          )
        : null,

      previousIncome: previousTrend.income,
      previousExpenses: previousTrend.expense,
    },

    incomeAnalysis: {
      totalIncome: income,

      averagePerIncome: count(convertedMonthlyRows, 'income')
        ? round(income / count(convertedMonthlyRows, 'income'))
        : 0,

      allTimeIncome: allIncome,
      allTimeExpenses: allExpenses,
      allTimeNet: round(allIncome - allExpenses),
    },

    dailyAnalysis: {
      daysInMonth,
      averageDailySpending: round(expenses / daysInMonth),
      highestSpendingDay,
      lowestSpendingDay,
      biggestExpense,
    },

    dailyTrend,
    trend,
    breakdown,

    generatedAt: new Date().toISOString(),
  };
}