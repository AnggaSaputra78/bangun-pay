import Project from '../models/Project.model.js';
import BaseRepository from './Base.repository.js';

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  async updateBudget(projectId, amount, operation = 'add') {
    const updateOperation =
      operation === 'add'
        ? {
            $inc: { totalExpense: amount },
          }
        : {
            $inc: { totalExpense: -amount },
          };

    const project = await this.model.findByIdAndUpdate(
      projectId,
      updateOperation,
      { new: true }
    );

    if (project) {
      project.remainingBudget = project.initialBudget - project.totalExpense;
      await project.save();
    }

    return project;
  }

  async getProjectsWithStats(options = {}) {
    const { page = 1, limit = 10, status, search } = options;
    const skip = (page - 1) * limit;

    const filter = { deletedAt: null };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const [projects, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.model.countDocuments(filter),
    ]);

    return {
      documents: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getDashboardStats() {
    const stats = await this.model.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          totalBudget: { $sum: '$initialBudget' },
          totalExpense: { $sum: '$totalExpense' },
        },
      },
    ]);

    return stats[0] || {
      totalProjects: 0,
      activeProjects: 0,
      totalBudget: 0,
      totalExpense: 0,
    };
  }
}

export default new ProjectRepository();