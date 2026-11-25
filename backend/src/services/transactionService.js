import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import { ApiError } from '../utils/ApiError.js';
import { convertTransactions } from './currencyService.js';

const DEFAULT_CATEGORIES = {
  income: [
    { name: 'Salary', color: '#10B981' },
    { name: 'Freelance', color: '#34D399' },
    { name: 'Business', color: '#059669' },
    { name: 'Investment', color: '#6EE7B7' },
    { name: 'Other income', color: '#A7F3D0' },
  ],
  expense: [
    { name: 'Food & dining', color: '#F59E0B' },
    { name: 'Transport', color: '#60A5FA' },
    { name: 'Shopping', color: '#F472B6' },
    { name: 'Bills & utilities', color: '#A78BFA' },
    { name: 'Healthcare', color: '#FB7185' },
    { name: 'Education', color: '#38BDF8' },
    { name: 'Entertainment', color: '#FBBF24' },
    { name: 'Other expense', color: '#94A3B8' },
  ],
};

const isValidObjectId = (value) => mongoose.isValidObjectId(value);

export async function ensureDefaultCategories(userId) {
  const operations = Object.entries(DEFAULT_CATEGORIES).flatMap(([type, categories]) =>
    categories.map(({ name, color }) => ({
      updateOne: {
        filter: { user: userId, type, name },
        update: { $setOnInsert: { user: userId, type, name, color, isDefault: true } },
        upsert: true,
      },
    }))
  );
  try {
    await Category.bulkWrite(operations, { ordered: false });
  } catch (error) {
    // Concurrent first requests can race on the unique user/type/name index.
    // Duplicate-key means another request inserted the same defaults; other errors must surface.
    if (error?.code !== 11000 && !error?.writeErrors?.every((item) => item.code === 11000)) throw error;
  }
}

export async function listCategories(userId, type) {
  await ensureDefaultCategories(userId);
  const filter = { user: userId };
  if (type) filter.type = type;
  return Category.find(filter).sort({ type: 1, isDefault: -1, name: 1 }).lean();
}

export async function createCategory(userId, payload) {
  await ensureDefaultCategories(userId);
  try {
    return await Category.create({ user: userId, ...payload, isDefault: false });
  } catch (error) {
    if (error?.code === 11000) throw ApiError.conflict('A category with this name already exists for this transaction type');
    throw error;
  }
}

async function validateCategory(userId, categoryId, type) {
  if (!isValidObjectId(categoryId)) throw ApiError.badRequest('Choose a valid category');
  const category = await Category.findOne({ _id: categoryId, user: userId, type });
  if (!category) throw ApiError.badRequest('The selected category does not belong to this account or transaction type');
  return category;
}

function buildFilters(userId, query) {
  const filter = { user: userId };
  if (query.type) filter.type = query.type;
  if (query.category) {
    if (!isValidObjectId(query.category)) throw ApiError.badRequest('Invalid category filter');
    filter.category = query.category;
  }
  if (query.from || query.to) {
    filter.date = {};
    if (query.from) {
      const from = new Date(`${query.from}T00:00:00.000Z`);
      if (Number.isNaN(from.getTime())) throw ApiError.badRequest('Invalid start date');
      filter.date.$gte = from;
    }
    if (query.to) {
      const to = new Date(`${query.to}T23:59:59.999Z`);
      if (Number.isNaN(to.getTime())) throw ApiError.badRequest('Invalid end date');
      filter.date.$lte = to;
    }
    if (filter.date.$gte && filter.date.$lte && filter.date.$gte > filter.date.$lte) {
      throw ApiError.badRequest('Start date must be on or before end date');
    }
  }
  if (query.search?.trim()) {
    const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.description = { $regex: escaped, $options: 'i' };
  }
  return filter;
}

export async function listTransactions(userId, query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 10));

  const filter = buildFilters(userId, query);

  const [items, total] = await Promise.all([
    Transaction.find(filter)
      .populate({ path: 'category', select: 'name type color' })
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  const targetCurrency = query.currency || 'INR';

  const convertedTransactions = await convertTransactions(
    items,
    targetCurrency
  );

  return {
    transactions: convertedTransactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getTransaction(userId, transactionId) {
  if (!isValidObjectId(transactionId)) throw ApiError.notFound('Transaction not found');
  const transaction = await Transaction.findOne({ _id: transactionId, user: userId })
    .populate({ path: 'category', select: 'name type color' })
    .lean();
  if (!transaction) throw ApiError.notFound('Transaction not found');
  return transaction;
}

export async function createTransaction(user, payload) {
  const category = await validateCategory(user.id, payload.category, payload.type);
  const transaction = await Transaction.create({
    ...payload,
    user: user.id,
    category: category.id,
    currency: user.currency || 'INR',
  });
  return getTransaction(user.id, transaction.id);
}

export async function updateTransaction(userId, transactionId, payload) {
  if (!isValidObjectId(transactionId)) throw ApiError.notFound('Transaction not found');
  const existing = await Transaction.findOne({ _id: transactionId, user: userId });
  if (!existing) throw ApiError.notFound('Transaction not found');
  const nextType = payload.type || existing.type;
  const nextCategory = payload.category || existing.category.toString();
  await validateCategory(userId, nextCategory, nextType);
  Object.assign(existing, payload, { category: nextCategory });
  await existing.save();
  return getTransaction(userId, transactionId);
}

export async function deleteTransaction(userId, transactionId) {
  if (!isValidObjectId(transactionId)) throw ApiError.notFound('Transaction not found');
  const deleted = await Transaction.findOneAndDelete({ _id: transactionId, user: userId });
  if (!deleted) throw ApiError.notFound('Transaction not found');
  return { id: transactionId };
}


/**
 * Imports a bounded batch into the authenticated user's workspace.
 * Categories are resolved per user/type and duplicate rows are skipped.
 */
export async function importTransactions(user, rows) {
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 500) {
    throw ApiError.badRequest('Import between 1 and 500 transactions at a time');
  }

  await ensureDefaultCategories(user.id);

  const categoryCache = new Map();
  const prepared = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];

    const type = String(row.type || '').toLowerCase();
    const amount = Number(row.amount);
    const description =
      String(row.description || 'Imported transaction').trim();
    const date = new Date(row.date);

    const categoryName = String(
      row.category ||
      (type === 'income' ? 'Other income' : 'Other expense')
    ).trim().slice(0, 40);

    const paymentMethod = [
      'cash',
      'upi',
      'card',
      'bank_transfer',
      'other',
    ].includes(row.paymentMethod)
      ? row.paymentMethod
      : 'other';

    if (
      !['income', 'expense'].includes(type) ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 1_000_000_000_000
    ) {
      throw ApiError.badRequest(`Invalid type or amount in row ${index + 1}`);
    }

    if (
      description.length > 120 ||
      Number.isNaN(date.getTime())
    ) {
      throw ApiError.badRequest(`Invalid description or date in row ${index + 1}`);
    }

    if (categoryName.length < 2) {
      throw ApiError.badRequest(`Invalid category in row ${index + 1}`);
    }

    const categoryKey = `${type}:${categoryName.toLowerCase()}`;
    let categoryId = categoryCache.get(categoryKey);

    if (!categoryId) {
      let category = await Category.findOne({
        user: user.id,
        type,
        name: {
          $regex: `^${categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
          $options: 'i',
        },
      });

      if (!category) {
        try {
          category = await Category.create({
            user: user.id,
            type,
            name: categoryName,
            color: type === 'income' ? '#10B981' : '#64748B',
            isDefault: false,
          });
        } catch (error) {
          if (error?.code !== 11000) throw error;

          category = await Category.findOne({
            user: user.id,
            type,
            name: categoryName,
          });
        }
      }

      categoryId = category.id;
      categoryCache.set(categoryKey, categoryId);
    }

    prepared.push({
      user: user.id,
      type,
      amount: Math.round(amount * 100) / 100,
      category: categoryId,
      description,
      date,
      paymentMethod,
      notes: String(row.notes || '').trim().slice(0, 500),
      currency: user.currency || 'INR',
    });
  }

  const dates = prepared.map((item) => item.date.getTime());

  const existing = await Transaction.find({
    user: user.id,
    date: {
      $gte: new Date(Math.min(...dates) - 86400000),
      $lte: new Date(Math.max(...dates) + 86400000),
    },
  })
    .select('type amount category description date')
    .lean();

  const dateKey = (value) =>
    new Date(value).toISOString().slice(0, 10);

  const makeKey = (item) => [
    item.type,
    Number(item.amount).toFixed(2),
    String(item.category),
    String(item.description).trim().toLowerCase(),
    dateKey(item.date),
  ].join('|');

  // Legacy matching now includes date.
  const makeLegacyKey = (item) => [
    item.type,
    Number(item.amount).toFixed(2),
    String(item.category),
    dateKey(item.date),
  ].join('|');

  const seen = new Set(existing.map(makeKey));
  const legacyByKey = new Map();

  for (const item of existing) {
    if (
      String(item.description || '').trim().toLowerCase() !==
      'imported transaction'
    ) {
      continue;
    }

    const key = makeLegacyKey(item);

    if (!legacyByKey.has(key)) {
      legacyByKey.set(key, []);
    }

    legacyByKey.get(key).push(item._id);
  }

  const fresh = [];
  const repairs = [];
  let skippedDuplicates = 0;

  for (const item of prepared) {
    const key = makeKey(item);

    if (seen.has(key)) {
      skippedDuplicates += 1;
      continue;
    }

    const legacyMatches = legacyByKey.get(makeLegacyKey(item));

    if (legacyMatches?.length) {
      const legacyId = legacyMatches.shift();

      repairs.push({
        updateOne: {
          filter: {
            _id: legacyId,
            user: user.id,
            description: 'Imported transaction',
          },
          update: {
            $set: {
              description: item.description,
              paymentMethod: item.paymentMethod,
            },
          },
        },
      });

      seen.add(key);
      continue;
    }

    seen.add(key);
    fresh.push(item);
  }

  if (repairs.length) {
    await Transaction.bulkWrite(repairs, { ordered: true });
  }

  if (fresh.length) {
    await Transaction.insertMany(fresh, { ordered: true });
  }

  return {
    imported: fresh.length,
    repairedLegacy: repairs.length,
    skippedDuplicates,
    totalReceived: rows.length,
  };
}
