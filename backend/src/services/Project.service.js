import projectRepository from '../repositories/Project.repository.js';
import logger from '../helpers/logger.js';

class ProjectService {
  async createProject(projectData, userId) {
    const project = await projectRepository.create({
      ...projectData,
      remainingBudget: projectData.initialBudget,
      createdBy: userId,
    });

    logger.info('Project created', { projectId: project._id, userId });
    return project;
  }

  async getAllProjects(options) {
    return await projectRepository.getProjectsWithStats(options);
  }

  async getProjectById(projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  async updateProject(projectId, updateData) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Jika initialBudget berubah, hitung ulang remainingBudget
    if (updateData.initialBudget && updateData.initialBudget !== project.initialBudget) {
      updateData.remainingBudget = updateData.initialBudget - project.totalExpense;
    }

    const updated = await projectRepository.update(projectId, updateData);
    logger.info('Project updated', { projectId });
    return updated;
  }

  async deleteProject(projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    await projectRepository.delete(projectId);
    logger.info('Project deleted', { projectId });
    return true;
  }

  async getDashboardStats() {
    return await projectRepository.getDashboardStats();
  }
}

export default new ProjectService();