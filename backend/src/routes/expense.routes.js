import express from 'express';
import expenseController from '../controllers/Expense.controller.js';
import validate from '../middlewares/validation.middleware.js';
import {
  createExpenseValidator,
  expenseIdValidator,
  projectIdParamValidator,
} from '../validators/Expense.validator.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import ExpenseCategory from '../models/ExpenseCategory.model.js';
import Expense from '../models/Expense.model.js';
import projectRepository from '../repositories/Project.repository.js';
import ApiResponse from '../helpers/ApiResponse.js';

const router = express.Router();

// Semua route di bawah ini memerlukan authentication
router.use(protect);

// ============================================
// CATEGORY ROUTES
// PENTING: Route statis harus di atas route /:id
// ============================================

/**
 * @route   GET /api/v1/expenses/categories
 * @desc    Get all active expense categories
 * @access  Private (all authenticated users)
 */
router.get('/categories', async (request, response, next) => {
  try {
    const categories = await ExpenseCategory.find({
      isActive: true,
      deletedAt: null,
    }).sort({ name: 1 });

    return ApiResponse.success(
      response,
      categories,
      'Categories retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/expenses/categories
 * @desc    Create new expense category
 * @access  Private (super_admin, admin only)
 */
router.post(
  '/categories',
  restrictTo('super_admin', 'admin'),
  async (request, response, next) => {
    try {
      const { name, description, color } = request.body;

      if (!name) {
        return ApiResponse.error(response, 'Category name is required', 400);
      }

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Check if category already exists
      const existing = await ExpenseCategory.findOne({
        $or: [{ slug }, { name }],
        deletedAt: null,
      });

      if (existing) {
        return ApiResponse.error(
          response,
          'Category with this name already exists',
          400
        );
      }

      const category = await ExpenseCategory.create({
        name,
        slug,
        description: description || '',
        color: color || '#F97316',
      });

      return ApiResponse.created(
        response,
        category,
        'Category created successfully'
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/v1/expenses/categories/:id
 * @desc    Update expense category
 * @access  Private (super_admin, admin only)
 */
router.put(
  '/categories/:id',
  restrictTo('super_admin', 'admin'),
  async (request, response, next) => {
    try {
      const { id } = request.params;
      const { name, description, color, isActive } = request.body;

      const category = await ExpenseCategory.findById(id);
      if (!category || category.deletedAt) {
        return ApiResponse.error(response, 'Category not found', 404);
      }

      const updateData = {};
      if (name !== undefined) {
        updateData.name = name;
        updateData.slug = name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      if (description !== undefined) updateData.description = description;
      if (color !== undefined) updateData.color = color;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updated = await ExpenseCategory.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      return ApiResponse.success(
        response,
        updated,
        'Category updated successfully'
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/v1/expenses/categories/:id
 * @desc    Soft delete expense category
 * @access  Private (super_admin only)
 */
router.delete(
  '/categories/:id',
  restrictTo('super_admin'),
  async (request, response, next) => {
    try {
      const { id } = request.params;

      const category = await ExpenseCategory.findById(id);
      if (!category || category.deletedAt) {
        return ApiResponse.error(response, 'Category not found', 404);
      }

      // Soft delete
      category.deletedAt = new Date();
      await category.save();

      return ApiResponse.success(
        response,
        null,
        'Category deleted successfully'
      );
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// EXPENSE ROUTES (Spesifik / Static)
// ============================================

/**
 * @route   GET /api/v1/expenses/recent
 * @desc    Get recent expenses across all projects
 * @access  Private
 */
router.get('/recent', expenseController.getRecentExpenses);

/**
 * @route   GET /api/v1/expenses
 * @desc    Get all expenses with filters (cross-project) + Stats
 * @access  Private
 * @query   search, projectId, categoryId, paymentMethod, startDate, endDate, page, limit, sort
 */
router.get('/', async (request, response, next) => {
  try {
    const {
      search = '',
      projectId,
      categoryId,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sort = '-expenseDate',
    } = request.query;

    // Build filter
    const filter = { deletedAt: null };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (projectId) filter.projectId = projectId;
    if (categoryId) filter.categoryId = categoryId;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      filter.expenseDate = {};
      if (startDate) filter.expenseDate.$gte = new Date(startDate);
      if (endDate) filter.expenseDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('categoryId', 'name slug color')
        .populate('projectId', 'name location')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Expense.countDocuments(filter),
    ]);

    return ApiResponse.paginated(
      response,
      expenses,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      'Expenses retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/expenses/project/:projectId
 * @desc    Get all expenses for a specific project
 * @access  Private
 */
router.get(
  '/project/:projectId',
  validate(projectIdParamValidator),
  expenseController.getExpensesByProject
);

/**
 * @route   GET /api/v1/expenses/project/:projectId/category-breakdown
 * @desc    Get expense breakdown by category for a project
 * @access  Private
 */
router.get(
  '/project/:projectId/category-breakdown',
  validate(projectIdParamValidator),
  expenseController.getExpensesByCategory
);

/**
 * @route   POST /api/v1/expenses
 * @desc    Create new expense (auto-updates project budget)
 * @access  Private (super_admin, admin, mandor)
 */
router.post(
  '/',
  restrictTo('super_admin', 'admin', 'mandor'),
  validate(createExpenseValidator),
  expenseController.createExpense
);

// ============================================
// DYNAMIC ROUTES (/:id) 
// PENTING: HARUS DILETAKKAN DI PALING BAWAH
// ============================================

/**
 * @route   GET /api/v1/expenses/:id
 * @desc    Get expense by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(expenseIdValidator),
  async (request, response, next) => {
    try {
      const expense = await Expense.findById(request.params.id)
        .where({ deletedAt: null })
        .populate('categoryId', 'name slug color')
        .populate('projectId', 'name location owner')
        .populate('createdBy', 'name email');

      if (!expense) {
        return ApiResponse.error(response, 'Expense not found', 404);
      }

      return ApiResponse.success(
        response,
        expense,
        'Expense retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/v1/expenses/:id
 * @desc    Update expense (recalculates project budget if amount changed)
 * @access  Private (super_admin, admin)
 */
router.put(
  '/:id',
  restrictTo('super_admin', 'admin'),
  validate(expenseIdValidator),
  async (request, response, next) => {
    try {
      const expense = await Expense.findById(request.params.id).where({
        deletedAt: null,
      });

      if (!expense) {
        return ApiResponse.error(response, 'Expense not found', 404);
      }

      const oldAmount = expense.amount;
      const newAmount = request.body.amount
        ? Number(request.body.amount)
        : oldAmount;

      // Update expense
      const updated = await Expense.findByIdAndUpdate(
        request.params.id,
        { $set: request.body },
        { new: true, runValidators: true }
      );

      // Adjust project budget if amount changed
      if (oldAmount !== newAmount) {
        const difference = newAmount - oldAmount;
        await projectRepository.updateBudget(
          expense.projectId,
          difference,
          'add'
        );
      }

      return ApiResponse.success(
        response,
        updated,
        'Expense updated successfully'
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/v1/expenses/:id
 * @desc    Delete expense (reverses project budget update)
 * @access  Private (super_admin, admin)
 */
router.delete(
  '/:id',
  restrictTo('super_admin', 'admin'),
  validate(expenseIdValidator),
  expenseController.deleteExpense
);

export default router;