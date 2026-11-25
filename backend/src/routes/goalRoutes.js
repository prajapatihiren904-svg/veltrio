import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as controller from '../controllers/goalController.js';
import { contributionRules, createGoalRules, goalIdRules, updateGoalRules } from '../validators/goalValidators.js';

const router = Router();
router.use(authenticate);
router.get('/', asyncHandler(controller.listGoals));
router.post('/', createGoalRules, validateRequest, asyncHandler(controller.createGoal));
router.patch('/:id', updateGoalRules, validateRequest, asyncHandler(controller.updateGoal));
router.post('/:id/contributions', contributionRules, validateRequest, asyncHandler(controller.addContribution));
router.delete('/:id', goalIdRules, validateRequest, asyncHandler(controller.deleteGoal));
export default router;
