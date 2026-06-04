import express from 'express';
import reportController from '../controllers/Report.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/v1/reports/financial
 * @desc    Get financial report with date range
 * @access  Private (super_admin, admin, owner)
 */
router.get(
  '/financial',
  restrictTo('super_admin', 'admin', 'owner'),
  reportController.getFinancialReport
);

/**
 * @route   GET /api/v1/reports/projects
 * @desc    Get project summary report
 * @access  Private (super_admin, admin, owner)
 */
router.get(
  '/projects',
  restrictTo('super_admin', 'admin', 'owner'),
  reportController.getProjectReport
);

/**
 * @route   GET /api/v1/reports/categories
 * @desc    Get category breakdown report
 * @access  Private
 */
router.get('/categories', reportController.getCategoryReport);

export default router;