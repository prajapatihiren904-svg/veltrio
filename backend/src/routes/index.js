import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import budgetRoutes from './budgetRoutes.js';
import goalRoutes from './goalRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import accountRoutes from './accountRoutes.js';
import adminRoutes from './adminRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import purchaseRoutes from './purchaseRoutes.js';

const router = Router();

// Feature registration points: keep each domain in its own router.
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/budgets', budgetRoutes);
router.use('/goals', goalRoutes);
router.use('/account', accountRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/purchases', purchaseRoutes);
export default router;
