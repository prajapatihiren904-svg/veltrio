import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

function buildMonthSlots(now, count = 6) {
  const slots = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    slots.push({
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`,
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      label: new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(date),
      income: 0,
      expense: 0,
    });
  }
  return slots;
}

/** All calculations are scoped to the authenticated user's ID. */
export async function getDashboardSummary(userId, currency = 'INR', now = new Date()) {
  const ownerId = new mongoose.Types.ObjectId(userId);
  const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const sixMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

  const [allTimeRows, currentMonthRows, monthlyRows, categoryRows, recentTransactions] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: ownerId } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { user: ownerId, date: { $gte: currentMonthStart, $lte: nextMonthStart } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { user: ownerId, date: { $gte: sixMonthStart, $lte: nextMonthStart } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Transaction.aggregate([
      { $match: { user: ownerId, type: 'expense', date: { $gte: currentMonthStart, $lte: nextMonthStart } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 6 },
    ]),
    Transaction.find({ user: ownerId })
      .sort({ date: -1, createdAt: -1 })
      .limit(6)
      .populate({ path: 'category', select: 'name color type' })
      .lean(),
  ]);

  const totalFor = (rows, type) => Number(rows.find((row) => row._id === type)?.total || 0);
  const countFor = (rows, type) => Number(rows.find((row) => row._id === type)?.count || 0);
  const totalIncome = roundMoney(totalFor(allTimeRows, 'income'));
  const totalExpenses = roundMoney(totalFor(allTimeRows, 'expense'));
  const monthIncome = roundMoney(totalFor(currentMonthRows, 'income'));
  const monthExpenses = roundMoney(totalFor(currentMonthRows, 'expense'));

  const monthlyTrend = buildMonthSlots(now);
  const slotByKey = new Map(monthlyTrend.map((slot) => [slot.key, slot]));
  for (const row of monthlyRows) {
    const key = `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;
    const slot = slotByKey.get(key);
    if (slot && (row._id.type === 'income' || row._id.type === 'expense')) {
      slot[row._id.type] = roundMoney(row.total);
    }
  }

  const categories = categoryRows.length
    ? await Category.find({ _id: { $in: categoryRows.map((row) => row._id) }, user: ownerId })
      .select('name color')
      .lean()
    : [];
  const categoryById = new Map(categories.map((category) => [String(category._id), category]));
  const expenseBreakdown = categoryRows.map((row) => {
    const category = categoryById.get(String(row._id));
    return {
      categoryId: String(row._id),
      name: category?.name || 'Uncategorised',
      color: category?.color || '#64748B',
      amount: roundMoney(row.total),
      percentage: monthExpenses > 0 ? roundMoney((row.total / monthExpenses) * 100) : 0,
    };
  });

  return {
    currency,
    totals: {
      income: totalIncome,
      expenses: totalExpenses,
      balance: roundMoney(totalIncome - totalExpenses),
      incomeCount: countFor(allTimeRows, 'income'),
      expenseCount: countFor(allTimeRows, 'expense'),
      transactionCount: allTimeRows.reduce((sum, row) => sum + Number(row.count || 0), 0),
    },
    currentMonth: {
      income: monthIncome,
      expenses: monthExpenses,
      net: roundMoney(monthIncome - monthExpenses),
      startDate: currentMonthStart.toISOString(),
    },
    monthlyTrend,
    expenseBreakdown,
    recentTransactions,
    generatedAt: now.toISOString(),
  };
}
