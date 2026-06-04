import express from 'express'
import expenseController from '../controllers/Expense.controller.js'
import validate from '../middlewares/validation.middleware.js'
import {
  createExpenseValidator,
  expenseIdValidator,
  projectIdParamValidator,
} from '../validators/Expense.validator.js'
import { protect, restrictTo } from '../middlewares/auth.middleware.js'
import ExpenseCategory from '../models/ExpenseCategory.model.js'
import ApiResponse from '../helpers/ApiResponse.js'

const router = express.Router()

// Semua route di bawah ini memerlukan authentication
router.use(protect)

// ============================================
// CATEGORY ROUTES
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
    }).sort({ name: 1 })

    return ApiResponse.success(
      response,
      categories,
      'Categories retrieved successfully'
    )
  } catch (error) {
    next(error)
  }
})

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
      const { name, description, color } = request.body

      if (!name) {
        return ApiResponse.error(response, 'Category name is required', 400)
      }

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Check if category already exists
      const existing = await ExpenseCategory.findOne({
        $or: [{ slug }, { name }],
        deletedAt: null,
      })

      if (existing) {
        return ApiResponse.error(
          response,
          'Category with this name already exists',
          400
        )
      }

      const category = await ExpenseCategory.create({
        name,
        slug,
        description: description || '',
        color: color || '#F97316',
      })

      return ApiResponse.created(
        response,
        category,
        'Category created successfully'
      )
    } catch (error) {
      next(error)
    }
  }
)

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
      const { id } = request.params
      const { name, description, color, isActive } = request.body

      const category = await ExpenseCategory.findById(id)
      if (!category || category.deletedAt) {
        return ApiResponse.error(response, 'Category not found', 404)
      }

      const updateData = {}
      if (name !== undefined) {
        updateData.name = name
        updateData.slug = name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }
      if (description !== undefined) updateData.description = description
      if (color !== undefined) updateData.color = color
      if (isActive !== undefined) updateData.isActive = isActive

      const updated = await ExpenseCategory.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      )

      return ApiResponse.success(
        response,
        updated,
        'Category updated successfully'
      )
    } catch (error) {
      next(error)
    }
  }
)

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
      const { id } = request.params

      const category = await ExpenseCategory.findById(id)
      if (!category || category.deletedAt) {
        return ApiResponse.error(response, 'Category not found', 404)
      }

      // Soft delete
      category.deletedAt = new Date()
      await category.save()

      return ApiResponse.success(
        response,
        null,
        'Category deleted successfully'
      )
    } catch (error) {
      next(error)
    }
  }
)

// ============================================
// EXPENSE ROUTES
// ============================================

/**
 * @route   GET /api/v1/expenses/recent
 * @desc    Get recent expenses across all projects
 * @access  Private
 * @query   limit (default: 5)
 */
router.get('/recent', expenseController.getRecentExpenses)

/**
 * @route   GET /api/v1/expenses/project/:projectId
 * @desc    Get all expenses for a specific project
 * @access  Private
 */
router.get(
  '/project/:projectId',
  validate(projectIdParamValidator),
  expenseController.getExpensesByProject
)

/**
 * @route   GET /api/v1/expenses/project/:projectId/category-breakdown
 * @desc    Get expense breakdown by category for a project
 * @access  Private
 */
router.get(
  '/project/:projectId/category-breakdown',
  validate(projectIdParamValidator),
  expenseController.getExpensesByCategory
)

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
)

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
      const Expense = (await import('../models/Expense.model.js')).default
      const expense = await Expense.findById(request.params.id)
        .where({ deletedAt: null })
        .populate('categoryId', 'name slug color')
        .populate('projectId', 'name')
        .populate('createdBy', 'name email')

      if (!expense) {
        return ApiResponse.error(response, 'Expense not found', 404)
      }

      return ApiResponse.success(
        response,
        expense,
        'Expense retrieved successfully'
      )
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   PUT /api/v1/expenses/:id
 * @desc    Update expense (recalculates project budget)
 * @access  Private (super_admin, admin)
 */
router.put(
  '/:id',
  restrictTo('super_admin', 'admin'),
  validate(expenseIdValidator),
  async (request, response, next) => {
    try {
      const Expense = (await import('../models/Expense.model.js')).default
      const projectRepository = (
        await import('../repositories/Project.repository.js')
      ).default

      const expense = await Expense.findById(request.params.id).where({
        deletedAt: null,
      })

      if (!expense) {
        return ApiResponse.error(response, 'Expense not found', 404)
      }

      const oldAmount = expense.amount
      const newAmount = request.body.amount
        ? Number(request.body.amount)
        : oldAmount

      // Update expense
      const updated = await Expense.findByIdAndUpdate(
        request.params.id,
        { $set: request.body },
        { new: true, runValidators: true }
      )

      // Adjust project budget if amount changed
      if (oldAmount !== newAmount) {
        const difference = newAmount - oldAmount
        await projectRepository.updateBudget(
          expense.projectId,
          difference,
          'add'
        )
      }

      return ApiResponse.success(
        response,
        updated,
        'Expense updated successfully'
      )
    } catch (error) {
      next(error)
    }
  }
)

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
)

export default router