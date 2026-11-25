import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as controller from '../controllers/budgetController.js';
import { budgetIdRules, listBudgetRules, upsertBudgetRules } from '../validators/budgetValidators.js';

const router = Router();
router.use(authenticate);
router.get('/', listBudgetRules, validateRequest, asyncHandler(controller.listBudgets));
router.put('/', upsertBudgetRules, validateRequest, asyncHandler(controller.upsertBudget));
router.delete('/:id', budgetIdRules, validateRequest, asyncHandler(controller.deleteBudget));
export default router;
