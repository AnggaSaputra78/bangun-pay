import express from 'express';
import projectController from '../controllers/project.controller.js';
import validate from '../middlewares/validation.middleware.js';
import {
  createProjectValidator,
  projectIdValidator,
} from '../validators/Project.validator.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get(
  '/dashboard/stats',
  restrictTo('super_admin', 'admin', 'owner'),
  projectController.getDashboardStats
);

router
  .route('/')
  .get(projectController.getAllProjects)
  .post(
    restrictTo('super_admin', 'admin'),
    validate(createProjectValidator),
    projectController.createProject
  );

router
  .route('/:id')
  .get(validate(projectIdValidator), projectController.getProjectById)
  .put(
    restrictTo('super_admin', 'admin'),
    validate(projectIdValidator),
    projectController.updateProject
  )
  .delete(
    restrictTo('super_admin', 'admin'),
    validate(projectIdValidator),
    projectController.deleteProject
  );

export default router;