import { body, param, query } from 'express-validator';

export const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 200 })
    .withMessage('Project name cannot exceed 200 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 300 })
    .withMessage('Location cannot exceed 300 characters'),
  body('owner')
    .trim()
    .notEmpty()
    .withMessage('Owner is required')
    .isLength({ max: 100 })
    .withMessage('Owner name cannot exceed 100 characters'),
  body('initialBudget')
    .notEmpty()
    .withMessage('Initial budget is required')
    .isFloat({ min: 0 })
    .withMessage('Budget cannot be negative'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
];

export const projectIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Invalid project ID format'),
];