import Expense from '../models/Expense.model.js';
import BaseRepository from './Base.repository.js';

class ExpenseRepository extends BaseRepository {
  constructor() {
    super(Expense);
  }

  async findByProject(projectId, options = {}) {
    const { page = 1, limit = 20, sort = '-expenseDate' } = options;
    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      this.model
        .find({ projectId, deletedAt: null })
        .populate('categoryId', 'name slug color')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      this.model.countDocuments({ projectId, deletedAt: null }),
    ]);

    return {
      documents: expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getExpensesByCategory(projectId) {
    return await this.model.aggregate([
      {
        $match: {
          projectId: new (await import('mongoose')).default.Types.ObjectId(projectId),
          deletedAt: null,
        },
      },
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
          _id: '$category.name',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          color: { $first: '$category.color' },
        },
      },
      { $sort: { total: -1 } },
    ]);
  }

  async getRecentExpenses(limit = 5) {
    return await this.model
      .find({ deletedAt: null })
      .populate('categoryId', 'name color')
      .populate('projectId', 'name')
      .sort({ expenseDate: -1 })
      .limit(limit);
  }
}

export default new ExpenseRepository();