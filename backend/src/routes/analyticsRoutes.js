import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getReport } from '../controllers/analyticsController.js';
import { analyticsQueryRules } from '../validators/analyticsValidators.js';

const router = Router();
router.use(authenticate);
router.get('/', analyticsQueryRules, validateRequest, asyncHandler(getReport));
export default router;
