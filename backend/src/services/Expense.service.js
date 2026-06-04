import expenseRepository from '../repositories/Expense.repository.js';
import projectRepository from '../repositories/Project.repository.js';
import logger from '../helpers/logger.js';

class ExpenseService {
  async createExpense(expenseData, userId) {
    // Validasi project ada
    const project = await projectRepository.findById(expenseData.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Cek apakah budget mencukupi
    const newRemaining = project.remainingBudget - expenseData.amount;
    if (newRemaining < 0) {
      logger.warn('Expense exceeds budget', {
        projectId: project._id,
        amount: expenseData.amount,
        remaining: project.remainingBudget,
      });
      throw new Error('Insufficient budget for this expense');
    }

    // Create expense
    const expense = await expenseRepository.create({
      ...expenseData,
      createdBy: userId,
    });

    // Update project budget
    await projectRepository.updateBudget(expenseData.projectId, expenseData.amount, 'add');

    logger.info('Expense created', {
      expenseId: expense._id,
      projectId: expenseData.projectId,
      amount: expenseData.amount,
      userId,
    });

    return expense;
  }

  async getExpensesByProject(projectId, options) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    return await expenseRepository.findByProject(projectId, options);
  }

  async deleteExpense(expenseId, userId) {
    const expense = await expenseRepository.findById(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }

    // Reverse the budget update
    await projectRepository.updateBudget(expense.projectId, expense.amount, 'subtract');

    await expenseRepository.delete(expenseId);

    logger.info('Expense deleted', {
      expenseId,
      amount: expense.amount,
      userId,
    });

    return true;
  }

  async getExpensesByCategory(projectId) {
    return await expenseRepository.getExpensesByCategory(projectId);
  }

  async getRecentExpenses(limit = 5) {
    return await expenseRepository.getRecentExpenses(limit);
  }
}

export default new ExpenseService();