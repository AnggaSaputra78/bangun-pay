import Expense from '../models/Expense.model.js';
import Project from '../models/Project.model.js';
import ApiResponse from '../helpers/ApiResponse.js';

class ReportController {
  /**
   * @desc    Get financial report with date range filter
   * @route   GET /api/v1/reports/financial
   * @access  Private (super_admin, admin, owner)
   */
  async getFinancialReport(request, response, next) {
    try {
      const { startDate, endDate, projectId } = request.query;

      // Build filter
      const filter = { deletedAt: null };
      if (startDate || endDate) {
        filter.expenseDate = {};
        if (startDate) filter.expenseDate.$gte = new Date(startDate);
        if (endDate) filter.expenseDate.$lte = new Date(endDate);
      }
      if (projectId) filter.projectId = projectId;

      // Get expenses
      const expenses = await Expense.find(filter)
        .populate('categoryId', 'name slug color')
        .populate('projectId', 'name location')
        .populate('createdBy', 'name email')
        .sort({ expenseDate: -1 });

      // Calculate summary
      const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalTransactions = expenses.length;
      const avgTransaction = totalTransactions > 0 ? totalExpense / totalTransactions : 0;

      // Group by month
      const monthlyData = {};
      expenses.forEach((expense) => {
        const month = new Date(expense.expenseDate).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
        });
        if (!monthlyData[month]) {
          monthlyData[month] = { month, total: 0, count: 0 };
        }
        monthlyData[month].total += expense.amount;
        monthlyData[month].count += 1;
      });

      // Group by category
      const categoryData = {};
      expenses.forEach((expense) => {
        const catName = expense.categoryId?.name || 'Unknown';
        if (!categoryData[catName]) {
          categoryData[catName] = {
            name: catName,
            color: expense.categoryId?.color || '#F97316',
            total: 0,
            count: 0,
          };
        }
        categoryData[catName].total += expense.amount;
        categoryData[catName].count += 1;
      });

      // Group by payment method
      const paymentData = {};
      expenses.forEach((expense) => {
        const method = expense.paymentMethod;
        if (!paymentData[method]) {
          paymentData[method] = { method, total: 0, count: 0 };
        }
        paymentData[method].total += expense.amount;
        paymentData[method].count += 1;
      });

      return ApiResponse.success(
        response,
        {
          summary: {
            totalExpense,
            totalTransactions,
            avgTransaction,
            startDate: startDate || null,
            endDate: endDate || null,
          },
          monthlyBreakdown: Object.values(monthlyData),
          categoryBreakdown: Object.values(categoryData),
          paymentBreakdown: Object.values(paymentData),
          transactions: expenses,
        },
        'Financial report retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Get project summary report
   * @route   GET /api/v1/reports/projects
   * @access  Private (super_admin, admin, owner)
   */
  async getProjectReport(request, response, next) {
    try {
      const { status } = request.query;

      const filter = { deletedAt: null };
      if (status) filter.status = status;

      const projects = await Project.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      // Calculate stats
      const totalBudget = projects.reduce((sum, p) => sum + p.initialBudget, 0);
      const totalExpense = projects.reduce((sum, p) => sum + p.totalExpense, 0);
      const totalRemaining = projects.reduce((sum, p) => sum + p.remainingBudget, 0);

      // Group by status
      const statusBreakdown = {};
      projects.forEach((project) => {
        const stat = project.status;
        if (!statusBreakdown[stat]) {
          statusBreakdown[stat] = { status: stat, count: 0, totalBudget: 0, totalExpense: 0 };
        }
        statusBreakdown[stat].count += 1;
        statusBreakdown[stat].totalBudget += project.initialBudget;
        statusBreakdown[stat].totalExpense += project.totalExpense;
      });

      // Find overbudget projects
      const overbudgetProjects = projects
        .filter((p) => p.budgetPercentage > 90)
        .sort((a, b) => b.budgetPercentage - a.budgetPercentage);

      return ApiResponse.success(
        response,
        {
          summary: {
            totalProjects: projects.length,
            totalBudget,
            totalExpense,
            totalRemaining,
            overallPercentage: totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0,
          },
          statusBreakdown: Object.values(statusBreakdown),
          overbudgetProjects,
          projects,
        },
        'Project report retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc    Get category breakdown report
   * @route   GET /api/v1/reports/categories
   * @access  Private
   */
  async getCategoryReport(request, response, next) {
    try {
      const { startDate, endDate, projectId } = request.query;

      const filter = { deletedAt: null };
      if (startDate || endDate) {
        filter.expenseDate = {};
        if (startDate) filter.expenseDate.$gte = new Date(startDate);
        if (endDate) filter.expenseDate.$lte = new Date(endDate);
      }
      if (projectId) filter.projectId = projectId;

      const result = await Expense.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'expensecategories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $group: {
            _id: '$category._id',
            name: { $first: '$category.name' },
            color: { $first: '$category.color' },
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
            avgAmount: { $avg: '$amount' },
            maxAmount: { $max: '$amount' },
            minAmount: { $min: '$amount' },
          },
        },
        { $sort: { totalAmount: -1 } },
      ]);

      const grandTotal = result.reduce((sum, cat) => sum + cat.totalAmount, 0);

      return ApiResponse.success(
        response,
        {
          categories: result.map((cat) => ({
            ...cat,
            percentage: grandTotal > 0 ? Math.round((cat.totalAmount / grandTotal) * 100) : 0,
          })),
          grandTotal,
          totalCategories: result.length,
        },
        'Category report retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportController();