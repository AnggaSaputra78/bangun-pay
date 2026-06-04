import express from 'express';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';
import expenseRoutes from './expense.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/expenses', expenseRoutes);

export default router;