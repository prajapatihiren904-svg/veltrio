import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getSummary } from '../controllers/dashboardController.js';

const router = Router();
router.use(authenticate);
router.get('/summary', asyncHandler(getSummary));

export default router;
