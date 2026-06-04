import express from 'express';
import expenseController from '../controllers/Expense.controller.js';
import validate from '../middlewares/validation.middleware.js';
import {
  createExpenseValidator,
  expenseIdValidator,
  projectIdParamValidator,
} from '../validators/Expense.validator.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/recent', expenseController.getRecentExpenses);

router.get(
  '/project/:projectId',
  validate(projectIdParamValidator),
  expenseController.getExpensesByProject
);

router.get(
  '/project/:projectId/category-breakdown',
  validate(projectIdParamValidator),
  expenseController.getExpensesByCategory
);

router.post(
  '/',
  restrictTo('super_admin', 'admin', 'mandor'),
  validate(createExpenseValidator),
  expenseController.createExpense
);

router.delete(
  '/:id',
  restrictTo('super_admin', 'admin'),
  validate(expenseIdValidator),
  expenseController.deleteExpense
);

export default router;