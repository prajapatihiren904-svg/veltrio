import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as controller from '../controllers/transactionController.js';


import {
  categoryQueryRules,
  categoryRules,
  createTransactionRules,
  listTransactionRules,
  transactionIdRules,
  updateTransactionRules,
  importTransactionRules,
} from '../validators/transactionValidators.js';

const router = Router();
router.use(authenticate);

router.get('/categories', categoryQueryRules, validateRequest, asyncHandler(controller.listCategories));
router.post('/categories', categoryRules, validateRequest, asyncHandler(controller.createCategory));
router.get('/', listTransactionRules, validateRequest, asyncHandler(controller.listTransactions));
router.post('/', createTransactionRules, validateRequest, asyncHandler(controller.createTransaction));
router.post(
  '/import',
  importTransactionRules,
  validateRequest,
  asyncHandler(controller.importTransactions)
);
router.get('/:id', transactionIdRules, validateRequest, asyncHandler(controller.getTransaction));
router.patch('/:id', updateTransactionRules, validateRequest, asyncHandler(controller.updateTransaction));
router.delete('/:id', transactionIdRules, validateRequest, asyncHandler(controller.deleteTransaction));

export default router;
