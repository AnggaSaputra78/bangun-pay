import expenseService from '../services/Expense.service.js';
import ApiResponse from '../helpers/ApiResponse.js';

class ExpenseController {
  async createExpense(request, response, next) {
    try {
      const expense = await expenseService.createExpense(
        request.body,
        request.user.id
      );
      return ApiResponse.created(response, expense, 'Expense created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getExpensesByProject(request, response, next) {
    try {
      const result = await expenseService.getExpensesByProject(
        request.params.projectId,
        request.query
      );
      return ApiResponse.paginated(
        response,
        result.documents,
        result.pagination,
        'Expenses retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteExpense(request, response, next) {
    try {
      await expenseService.deleteExpense(request.params.id, request.user.id);
      return ApiResponse.success(response, null, 'Expense deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getExpensesByCategory(request, response, next) {
    try {
      const result = await expenseService.getExpensesByCategory(
        request.params.projectId
      );
      return ApiResponse.success(
        response,
        result,
        'Category breakdown retrieved'
      );
    } catch (error) {
      next(error);
    }
  }

  async getRecentExpenses(request, response, next) {
    try {
      const limit = parseInt(request.query.limit) || 5;
      const result = await expenseService.getRecentExpenses(limit);
      return ApiResponse.success(
        response,
        result,
        'Recent expenses retrieved'
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new ExpenseController();