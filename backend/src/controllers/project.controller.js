import projectService from '../services/Project.service.js';
import ApiResponse from '../helpers/ApiResponse.js';

class ProjectController {
  async createProject(request, response, next) {
    try {
      const project = await projectService.createProject(
        request.body,
        request.user.id
      );
      return ApiResponse.created(response, project, 'Project created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllProjects(request, response, next) {
    try {
      const result = await projectService.getAllProjects(request.query);
      return ApiResponse.paginated(
        response,
        result.documents,
        result.pagination,
        'Projects retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(request, response, next) {
    try {
      const project = await projectService.getProjectById(request.params.id);
      return ApiResponse.success(response, project, 'Project retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProject(request, response, next) {
    try {
      const project = await projectService.updateProject(
        request.params.id,
        request.body
      );
      return ApiResponse.success(response, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(request, response, next) {
    try {
      await projectService.deleteProject(request.params.id);
      return ApiResponse.success(response, null, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(request, response, next) {
    try {
      const stats = await projectService.getDashboardStats();
      return ApiResponse.success(response, stats, 'Dashboard stats retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export default new ProjectController();