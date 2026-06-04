import authService from '../services/Auth.service.js';
import ApiResponse from '../helpers/ApiResponse.js';
import logger from '../helpers/logger.js';

class AuthController {
  async login(request, response, next) {
    try {
      const { email, password } = request.body;
      const ipAddress = request.ip;
      const userAgent = request.get('user-agent');

      const result = await authService.login(email, password, ipAddress, userAgent);

      response.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return ApiResponse.success(
        response,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        'Login successful',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  async register(request, response, next) {
    try {
      const userData = request.body;

      const user = await authService.register(userData);

      return ApiResponse.created(response, user, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(request, response, next) {
    try {
      const userId = request.user.id;
      const refreshToken = request.cookies.refreshToken;

      if (!refreshToken) {
        response.clearCookie('refreshToken');
        return ApiResponse.success(response, null, 'Logout successful');
      }

      await authService.logout(userId, refreshToken);

      response.clearCookie('refreshToken');

      return ApiResponse.success(response, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async logoutAllDevices(request, response, next) {
    try {
      const userId = request.user.id;

      await authService.logoutAllDevices(userId);

      response.clearCookie('refreshToken');

      return ApiResponse.success(
        response,
        null,
        'Logged out from all devices successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async refreshAccessToken(request, response, next) {
    try {
      const refreshToken = request.cookies.refreshToken;

      if (!refreshToken) {
        return ApiResponse.error(response, 'Refresh token not found', 401);
      }

      const result = await authService.refreshAccessToken(refreshToken);

      response.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return ApiResponse.success(
        response,
        {
          accessToken: result.accessToken,
        },
        'Access token refreshed successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(request, response, next) {
    try {
      const userId = request.user.id;

      const user = await authService.getCurrentUser(userId);

      return ApiResponse.success(response, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();