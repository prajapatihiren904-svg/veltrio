import { Router } from 'express';

import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import * as controller from '../controllers/purchaseController.js';

import {
  createPurchaseRules,
  updatePurchaseRules,
  purchasePaymentRules,
  purchaseIdRules,
} from '../validators/purchaseValidators.js';

const router = Router();

router.use(authenticate);

// List purchases
router.get(
  '/',
  asyncHandler(controller.listPurchases)
);

// Create purchase
router.post(
  '/',
  createPurchaseRules,
  validateRequest,
  asyncHandler(controller.createPurchase)
);

// Record installment payment
router.post(
  '/:id/payments',
  purchasePaymentRules,
  validateRequest,
  asyncHandler(controller.recordPayment)
);

// Update purchase
router.patch(
  '/:id',
  updatePurchaseRules,
  validateRequest,
  asyncHandler(controller.updatePurchase)
);

// Delete purchase
router.delete(
  '/:id',
  purchaseIdRules,
  validateRequest,
  asyncHandler(controller.deletePurchase)
);

export default router;