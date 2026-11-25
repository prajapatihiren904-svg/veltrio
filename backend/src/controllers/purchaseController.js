import { sendSuccess } from '../utils/apiResponse.js';
import * as purchaseService from '../services/purchaseService.js';

const getUserCurrency = (req) =>
  req.user.currency || 'INR';

// ======================================
// LIST PURCHASES
// ======================================

export async function listPurchases(req, res) {
  const data = await purchaseService.listPurchases(
    req.user.id,
    getUserCurrency(req)
  );

  return sendSuccess(res, { data });
}

// ======================================
// CREATE PURCHASE
// ======================================

export async function createPurchase(req, res) {
  const purchase = await purchaseService.createPurchase(
    req.user.id,
    req.body,
    getUserCurrency(req)
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Purchase created successfully',
    data: { purchase },
  });
}

// ======================================
// UPDATE PURCHASE
// ======================================

export async function updatePurchase(req, res) {
  const purchase = await purchaseService.updatePurchase(
    req.user.id,
    req.params.id,
    req.body,
    getUserCurrency(req)
  );

  return sendSuccess(res, {
    message: 'Purchase updated successfully',
    data: { purchase },
  });
}

// ======================================
// RECORD PAYMENT
// ======================================

export async function recordPayment(req, res) {
  const purchase = await purchaseService.recordPayment(
    req.user.id,
    req.params.id,
    req.body,
    getUserCurrency(req)
  );

  return sendSuccess(res, {
    message: 'Payment recorded successfully',
    data: { purchase },
  });
}

// ======================================
// DELETE PURCHASE
// ======================================

export async function deletePurchase(req, res) {
  const data = await purchaseService.deletePurchase(
    req.user.id,
    req.params.id
  );

  return sendSuccess(res, {
    message: 'Purchase deleted successfully',
    data,
  });
}