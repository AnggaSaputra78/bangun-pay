import { body, param } from 'express-validator';

export const createExpenseValidator = [
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Invalid project ID format'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid category ID format'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Expense name is required')
    .isLength({ max: 200 })
    .withMessage('Expense name cannot exceed 200 characters'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount cannot be negative'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'bank_transfer', 'e_wallet', 'credit_card'])
    .withMessage('Invalid payment method'),
  body('expenseDate')
    .notEmpty()
    .withMessage('Expense date is required')
    .isISO8601()
    .withMessage('Expense date must be a valid date'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

export const expenseIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Expense ID is required')
    .isMongoId()
    .withMessage('Invalid expense ID format'),
];

export const projectIdParamValidator = [
  param('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Invalid project ID format'),
];