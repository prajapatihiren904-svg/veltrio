import mongoose from 'mongoose';
import Purchase from '../models/Purchase.js';
import { ApiError } from '../utils/ApiError.js';
import {
  convertAmount,
  getExchangeRate,
} from './currencyService.js';

// ======================================
// HELPERS
// ======================================

const getCurrency = (currency) =>
  String(currency || 'INR').toUpperCase();

const roundAmount = (amount) =>
  Number(Number(amount).toFixed(2));

const todayUtc = () =>
  new Date(new Date().toISOString().slice(0, 10));

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function addMonths(date, months) {
  const result = new Date(date);

  const originalDay = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);

  const lastDay = new Date(
    Date.UTC(
      result.getUTCFullYear(),
      result.getUTCMonth() + 1,
      0
    )
  ).getUTCDate();

  result.setUTCDate(Math.min(originalDay, lastDay));

  return result;
}

// ======================================
// GENERATE PAYMENT SCHEDULE
// ======================================

function generateSchedule({
  remainingAmount,
  installmentAmount,
  frequency,
  startDate,
  customIntervalDays,
}) {
  const remaining = roundAmount(remainingAmount);

  if (remaining <= 0) return [];

  if (frequency === 'full') return [];

  if (!installmentAmount || installmentAmount <= 0) {
    throw ApiError.badRequest(
      'Enter a valid installment amount'
    );
  }

  const payments = [];

  let balance = remaining;
  let currentDate = new Date(startDate);

  let index = 0;

  while (balance > 0.001) {
    index++;

    if (index > 600) {
      throw ApiError.badRequest(
        'Payment schedule is too long'
      );
    }

    const amount = roundAmount(
      Math.min(installmentAmount, balance)
    );

    payments.push({
      amount,
      dueDate: new Date(currentDate),
      paidDate: null,
      status: 'upcoming',
      note: '',
    });

    balance = roundAmount(balance - amount);

    if (frequency === 'weekly') {
      currentDate = addDays(currentDate, 7);
    } else if (frequency === 'monthly') {
      currentDate = addMonths(currentDate, 1);
    } else if (frequency === 'custom') {
      currentDate = addDays(
        currentDate,
        customIntervalDays || 30
      );
    } else {
      throw ApiError.badRequest(
        'Invalid payment frequency'
      );
    }
  }

  return payments;
}

// ======================================
// DERIVE PURCHASE DETAILS
// ======================================

function derivePurchase(purchase) {
  const totalPrice = Number(purchase.totalPrice || 0);

  const initialPaidAmount = Number(
    purchase.initialPaidAmount || 0
  );

  const payments = (purchase.payments || []).map(
    (payment) => {
      const paid = payment.status === 'paid';

      const overdue =
        !paid &&
        new Date(payment.dueDate) < todayUtc();

      return {
        ...payment,
        status: paid
          ? 'paid'
          : overdue
            ? 'overdue'
            : 'upcoming',
      };
    }
  );

  const installmentPaid = payments
    .filter((payment) => payment.status === 'paid')
    .reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

  const totalPaid = roundAmount(
    initialPaidAmount + installmentPaid
  );

  const remainingAmount = roundAmount(
    Math.max(0, totalPrice - totalPaid)
  );

  const paidInstallments = payments.filter(
    (payment) => payment.status === 'paid'
  ).length;

  const pendingInstallments = payments.filter(
    (payment) => payment.status !== 'paid'
  ).length;

  const overdueInstallments = payments.filter(
    (payment) => payment.status === 'overdue'
  ).length;

  const nextPayment = payments.find(
    (payment) => payment.status !== 'paid'
  );

  const progress =
    totalPrice > 0
      ? Number(
          ((totalPaid / totalPrice) * 100).toFixed(1)
        )
      : 0;

  return {
    ...purchase,

    totalPrice,
    initialPaidAmount,
    totalPaid,
    remainingAmount,

    progress,

    paidInstallments,
    pendingInstallments,
    overdueInstallments,

    nextPayment: nextPayment || null,

    status:
      remainingAmount <= 0
        ? 'completed'
        : overdueInstallments > 0
          ? 'overdue'
          : 'active',

    payments,
  };
}

// ======================================
// CONVERT PURCHASE CURRENCY
// ======================================

async function presentPurchase(
  purchase,
  targetCurrency
) {
  const derived = derivePurchase(purchase);

  const sourceCurrency = getCurrency(derived.currency);
  const target = getCurrency(targetCurrency);

  const rate = await getExchangeRate(
    sourceCurrency,
    target
  );

  const convert = (amount) =>
    convertAmount(amount, sourceCurrency, target);

  const convertedPayments = await Promise.all(
    derived.payments.map(async (payment) => ({
      ...payment,

      originalAmount: payment.amount,
      originalCurrency: sourceCurrency,

      amount: await convert(payment.amount),
      currency: target,
    }))
  );

  return {
    ...derived,

    originalTotalPrice: derived.totalPrice,
    originalInitialPaidAmount: derived.initialPaidAmount,
    originalTotalPaid: derived.totalPaid,
    originalRemainingAmount: derived.remainingAmount,

    totalPrice: await convert(derived.totalPrice),
    initialPaidAmount: await convert(
      derived.initialPaidAmount
    ),
    totalPaid: await convert(derived.totalPaid),
    remainingAmount: await convert(
      derived.remainingAmount
    ),

    payments: convertedPayments,

    currency: target,
    originalCurrency: sourceCurrency,
    exchangeRate: rate,
  };
}

// ======================================
// VALIDATE PURCHASE PAYLOAD
// ======================================

function validatePurchasePayload(payload) {
  const totalPrice = Number(payload.totalPrice);
  const initialPaid = Number(payload.initialPaidAmount);

  if (
    !Number.isFinite(totalPrice) ||
    totalPrice <= 0
  ) {
    throw ApiError.badRequest(
      'Enter a valid purchase price'
    );
  }

  if (
    !Number.isFinite(initialPaid) ||
    initialPaid < 0 ||
    initialPaid > totalPrice
  ) {
    throw ApiError.badRequest(
      'Initial payment cannot exceed the purchase price'
    );
  }

  const frequency = payload.paymentFrequency;

  if (
    frequency !== 'full' &&
    frequency !== 'weekly' &&
    frequency !== 'monthly' &&
    frequency !== 'custom'
  ) {
    throw ApiError.badRequest(
      'Invalid payment frequency'
    );
  }

  if (
    frequency === 'full' &&
    initialPaid !== totalPrice
  ) {
    throw ApiError.badRequest(
      'Full payment requires the complete purchase amount'
    );
  }

  if (
    frequency !== 'full' &&
    totalPrice - initialPaid > 0 &&
    Number(payload.installmentAmount) <= 0
  ) {
    throw ApiError.badRequest(
      'Enter a valid installment amount'
    );
  }

  if (
    frequency === 'custom' &&
    (
      !Number.isInteger(Number(payload.customIntervalDays)) ||
      Number(payload.customIntervalDays) < 1 ||
      Number(payload.customIntervalDays) > 365
    )
  ) {
    throw ApiError.badRequest(
      'Custom interval must be between 1 and 365 days'
    );
  }
}

// ======================================
// LIST PURCHASES
// ======================================

export async function listPurchases(
  userId,
  targetCurrency = 'INR'
) {
  const target = getCurrency(targetCurrency);

  const purchases = await Purchase.find({
    user: userId,
  })
    .sort({ createdAt: -1 })
    .lean();

  const items = await Promise.all(
    purchases.map((purchase) =>
      presentPurchase(purchase, target)
    )
  );

  return {
    items,

    totals: {
      totalPurchaseValue: roundAmount(
        items.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        )
      ),

      totalPaid: roundAmount(
        items.reduce(
          (sum, item) => sum + item.totalPaid,
          0
        )
      ),

      outstandingAmount: roundAmount(
        items.reduce(
          (sum, item) => sum + item.remainingAmount,
          0
        )
      ),

      activePurchases: items.filter(
        (item) => item.status !== 'completed'
      ).length,

      completedPurchases: items.filter(
        (item) => item.status === 'completed'
      ).length,
    },

    currency: target,
  };
}

// ======================================
// CREATE PURCHASE
// ======================================

export async function createPurchase(
  userId,
  payload,
  targetCurrency = 'INR'
) {
  validatePurchasePayload(payload);

  const currency = getCurrency(targetCurrency);

  await getExchangeRate(currency, currency);

  const totalPrice = Number(payload.totalPrice);

  const initialPaidAmount = Number(
    payload.initialPaidAmount
  );

  const remainingAmount = roundAmount(
    totalPrice - initialPaidAmount
  );

  const startDate = new Date(
    `${payload.startDate}T00:00:00.000Z`
  );

  const payments = generateSchedule({
    remainingAmount,

    installmentAmount: Number(
      payload.installmentAmount || 0
    ),

    frequency: payload.paymentFrequency,

    startDate,

    customIntervalDays: Number(
      payload.customIntervalDays || 30
    ),
  });

  const purchase = await Purchase.create({
    user: userId,

    productName: payload.productName,
    category: payload.category || 'other',
    description: payload.description || '',

    totalPrice,
    initialPaidAmount,

    currency,

    paymentFrequency: payload.paymentFrequency,

    installmentAmount: Number(
      payload.installmentAmount || 0
    ),

    customIntervalDays: Number(
      payload.customIntervalDays || 30
    ),

    startDate,

    payments,
  });

  return presentPurchase(
    purchase.toObject(),
    currency
  );
}

// ======================================
// UPDATE PURCHASE
// ======================================

export async function updatePurchase(
  userId,
  purchaseId,
  payload,
  targetCurrency = 'INR'
) {
  if (!mongoose.isValidObjectId(purchaseId)) {
    throw ApiError.badRequest('Invalid purchase');
  }

  const purchase = await Purchase.findOne({
    _id: purchaseId,
    user: userId,
  });

  if (!purchase) {
    throw ApiError.notFound('Purchase not found');
  }

  if (
    purchase.payments.some(
      (payment) => payment.status === 'paid'
    )
  ) {
    throw ApiError.badRequest(
      'Purchases with recorded installment payments cannot be edited yet. Please preserve the payment history.'
    );
  }

  validatePurchasePayload(payload);

  const displayCurrency = getCurrency(targetCurrency);
  const baseCurrency = getCurrency(purchase.currency);

  const totalPrice = await convertAmount(
    Number(payload.totalPrice),
    displayCurrency,
    baseCurrency
  );

  const initialPaidAmount = await convertAmount(
    Number(payload.initialPaidAmount),
    displayCurrency,
    baseCurrency
  );

  if (initialPaidAmount > totalPrice) {
    throw ApiError.badRequest(
      'Initial payment cannot exceed the purchase price'
    );
  }

  const remainingAmount = roundAmount(
    totalPrice - initialPaidAmount
  );

  const startDate = new Date(
    `${payload.startDate}T00:00:00.000Z`
  );

  const installmentAmount = await convertAmount(
    Number(payload.installmentAmount || 0),
    displayCurrency,
    baseCurrency
  );

  const payments = generateSchedule({
    remainingAmount,
    installmentAmount,
    frequency: payload.paymentFrequency,
    startDate,
    customIntervalDays: Number(
      payload.customIntervalDays || 30
    ),
  });

  purchase.productName = payload.productName;
  purchase.category = payload.category || 'other';
  purchase.description = payload.description || '';

  purchase.totalPrice = totalPrice;
  purchase.initialPaidAmount = initialPaidAmount;

  purchase.paymentFrequency = payload.paymentFrequency;
  purchase.installmentAmount = installmentAmount;

  purchase.customIntervalDays = Number(
    payload.customIntervalDays || 30
  );

  purchase.startDate = startDate;
  purchase.payments = payments;

  await purchase.save();

  return presentPurchase(
    purchase.toObject(),
    displayCurrency
  );
}

// ======================================
// RECORD INSTALLMENT PAYMENT
// ======================================

export async function recordPayment(
  userId,
  purchaseId,
  payload,
  targetCurrency = 'INR'
) {
  if (!mongoose.isValidObjectId(purchaseId)) {
    throw ApiError.badRequest('Invalid purchase');
  }

  const purchase = await Purchase.findOne({
    _id: purchaseId,
    user: userId,
  });

  if (!purchase) {
    throw ApiError.notFound('Purchase not found');
  }

  const displayCurrency = getCurrency(targetCurrency);
  const baseCurrency = getCurrency(purchase.currency);

  const amount = await convertAmount(
    Number(payload.amount),
    displayCurrency,
    baseCurrency
  );

  if (!Number.isFinite(amount) || amount <= 0) {
    throw ApiError.badRequest(
      'Enter a valid payment amount'
    );
  }

  const payment = purchase.payments.find(
    (item) => item.status !== 'paid'
  );

  if (!payment) {
    throw ApiError.badRequest(
      'No pending installment found'
    );
  }

  // Each scheduled installment is recorded as a
  // complete payment. Partial payments are not
  // supported in this version.

  if (
    Math.abs(
      Number(payment.amount) - amount
    ) > 0.02
  ) {
    throw ApiError.badRequest(
      `The next installment amount is ${payment.amount}`
    );
  }

  const paidDate = payload.date
    ? new Date(`${payload.date}T00:00:00.000Z`)
    : new Date();

  payment.status = 'paid';
  payment.paidDate = paidDate;
  payment.note = payload.note || '';

  await purchase.save();

  return presentPurchase(
    purchase.toObject(),
    displayCurrency
  );
}

// ======================================
// DELETE PURCHASE
// ======================================

export async function deletePurchase(
  userId,
  purchaseId
) {
  if (!mongoose.isValidObjectId(purchaseId)) {
    throw ApiError.badRequest('Invalid purchase');
  }

  const purchase = await Purchase.findOneAndDelete({
    _id: purchaseId,
    user: userId,
  });

  if (!purchase) {
    throw ApiError.notFound('Purchase not found');
  }

  return {
    id: purchase.id,
  };
}