import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Feedback from '../models/Feedback.js';
import { ApiError } from '../utils/ApiError.js';

const publicUserFields = 'name email role status currency createdAt lastLoginAt';

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 1. Admin Dashboard Overview
export async function getAdminOverview() {
  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalTransactions,
    transactionStats,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),

    User.countDocuments({ status: 'active' }),

    User.countDocuments({ status: 'suspended' }),

    Transaction.countDocuments(),

    Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),

    User.find()
      .select(publicUserFields)
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const income = transactionStats.find(
    (item) => item._id === 'income'
  );

  const expense = transactionStats.find(
    (item) => item._id === 'expense'
  );

  const totalIncome = Number(income?.total || 0);
  const totalExpenses = Number(expense?.total || 0);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
    },

    transactions: {
      total: totalTransactions,
      incomeCount: Number(income?.count || 0),
      expenseCount: Number(expense?.count || 0),
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
    },

    recentUsers,
  };
}

// 2. Get All Users with Search and Pagination
export async function getAdminUsers({
  page = 1,
  limit = 10,
  search = '',
  status,
}) {
  const currentPage = Math.max(1, Number(page) || 1);
  const pageLimit = Math.min(100, Math.max(1, Number(limit) || 10));

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (search.trim()) {
    const safeSearch = escapeRegex(search.trim());

    filter.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const [users, totalUsers] = await Promise.all([
    User.find(filter)
      .select(publicUserFields)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit)
      .lean(),

    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      currentPage,
      limit: pageLimit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / pageLimit),
    },
  };
}

// 3. Get Single User Details
export async function getAdminUserById(userId) {
  const user = await User.findById(userId)
    .select(publicUserFields)
    .lean();

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const [transactionCount, transactionStats] = await Promise.all([
    Transaction.countDocuments({ user: userId }),

    Transaction.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  return {
    user,
    transactions: {
      total: transactionCount,
      income: Number(
        transactionStats.find((item) => item._id === 'income')?.total || 0
      ),
      expenses: Number(
        transactionStats.find((item) => item._id === 'expense')?.total || 0
      ),
    },
  };
}

// 4. Suspend or Activate a User
export async function updateAdminUserStatus(
  targetUserId,
  status,
  currentAdminId
) {
  if (String(targetUserId) === String(currentAdminId)) {
    throw ApiError.badRequest('You cannot change your own account status');
  }

  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    throw ApiError.notFound('User not found');
  }

  if (targetUser.role === 'admin') {
    throw ApiError.forbidden('Admin accounts cannot be suspended here');
  }

  targetUser.status = status;
  await targetUser.save();

  return {
    id: targetUser.id,
    name: targetUser.name,
    email: targetUser.email,
    role: targetUser.role,
    status: targetUser.status,
  };
}

// 5. Get All Feedback with Filters and Pagination
export async function getAdminFeedback({
  page = 1,
  limit = 10,
  type,
  status,
  search = '',
}) {
  const currentPage = Math.max(1, Number(page) || 1);
  const pageLimit = Math.min(100, Math.max(1, Number(limit) || 10));

  const filter = {};

  if (type) {
    filter.type = type;
  }

  if (status) {
    filter.status = status;
  }

  if (search.trim()) {
    filter.subject = {
      $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
  }

  const [feedback, totalFeedback] = await Promise.all([
    Feedback.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageLimit)
      .limit(pageLimit)
      .lean(),

    Feedback.countDocuments(filter),
  ]);

  return {
    feedback,
    pagination: {
      currentPage,
      limit: pageLimit,
      totalFeedback,
      totalPages: Math.ceil(totalFeedback / pageLimit),
    },
  };
}


// 6. Get Feedback Statistics
export async function getAdminFeedbackStats() {
  const [total, newCount, inProgress, resolved, byType] =
    await Promise.all([
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'new' }),
      Feedback.countDocuments({ status: 'in_progress' }),
      Feedback.countDocuments({ status: 'resolved' }),

      Feedback.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

  return {
    total,
    new: newCount,
    inProgress,
    resolved,
    byType,
  };
}


// 7. Update Feedback Status
export async function updateAdminFeedbackStatus(feedbackId, status) {
  const feedback = await Feedback.findById(feedbackId);

  if (!feedback) {
    throw ApiError.notFound('Feedback not found');
  }

  feedback.status = status;

  await feedback.save();

  return feedback.toObject();
}

// 8. Admin responds to user feedback
export async function respondToFeedback(feedbackId, response, adminId) {
  const feedback = await Feedback.findById(feedbackId);

  if (!feedback) {
    throw ApiError.notFound('Feedback not found');
  }

  feedback.response = response.trim();
  feedback.respondedAt = new Date();
  feedback.respondedBy = adminId;

  await feedback.save();

  return feedback.toObject();
}