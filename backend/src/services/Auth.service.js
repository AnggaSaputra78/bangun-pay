import userRepository from '../repositories/User.repository.js';
import tokenService from './Token.service.js';
import logger from '../helpers/logger.js';

class AuthService {
  async login(email, password, ipAddress, userAgent) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      logger.warn('Login attempt failed - User not found', { email });
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      logger.warn('Login attempt failed - User inactive', { email });
      throw new Error('Account is deactivated');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      logger.warn('Login attempt failed - Invalid password', { email });
      throw new Error('Invalid email or password');
    }

    const { accessToken, refreshToken, refreshTokenExpiresAt } =
      tokenService.generateTokenPair(user);

    await userRepository.addRefreshToken(
      user._id,
      refreshToken,
      refreshTokenExpiresAt
    );

    await userRepository.updateLastLogin(user._id);

    await userRepository.cleanExpiredRefreshTokens(user._id);

    logger.info('User logged in successfully', {
      userId: user._id,
      email: user.email,
      ipAddress,
      userAgent,
    });

    return {
      user,
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    };
  }

  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user = await userRepository.create(userData);

    logger.info('User registered successfully', {
      userId: user._id,
      email: user.email,
    });

    return user;
  }

  async logout(userId, refreshToken) {
    await userRepository.removeRefreshToken(userId, refreshToken);

    logger.info('User logged out successfully', { userId });

    return true;
  }

  async logoutAllDevices(userId) {
    await userRepository.clearAllRefreshTokens(userId);

    logger.info('User logged out from all devices', { userId });

    return true;
  }

  async refreshAccessToken(refreshToken) {
    const decoded = tokenService.verifyRefreshToken(refreshToken);

    const user = await userRepository.findByIdWithPassword(decoded.id);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const storedToken = user.refreshTokens.find(
      (token) => token.token === refreshToken
    );

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await userRepository.removeRefreshToken(user._id, refreshToken);
      throw new Error('Refresh token expired');
    }

    await userRepository.removeRefreshToken(user._id, refreshToken);

    const { accessToken, refreshToken: newRefreshToken, refreshTokenExpiresAt } =
      tokenService.generateTokenPair(user);

    await userRepository.addRefreshToken(
      user._id,
      newRefreshToken,
      refreshTokenExpiresAt
    );

    await userRepository.cleanExpiredRefreshTokens(user._id);

    logger.info('Access token refreshed', { userId: user._id });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt,
    };
  }

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

export default new AuthService();