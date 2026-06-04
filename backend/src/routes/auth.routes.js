import express from 'express';
import authController from '../controllers/auth.controller.js';
import validate from '../middlewares/validation.middleware.js';
import {
  loginValidator,
  registerValidator,
} from '../validators/Auth.validator.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', validate(loginValidator), authController.login);

router.post('/register', validate(registerValidator), authController.register);

router.post('/logout', protect, authController.logout);

router.post('/logout-all', protect, authController.logoutAllDevices);

router.post('/refresh-token', authController.refreshAccessToken);

router.get('/me', protect, authController.getCurrentUser);

export default router;