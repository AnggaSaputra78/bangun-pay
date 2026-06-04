import tokenService from '../services/Token.service.js';
import userRepository from '../repositories/User.repository.js';
import { AppError } from './errorHandler.middleware.js';

const protect = async (request, response, next) => {
  try {
    let token;

    if (
      request.headers.authorization &&
      request.headers.authorization.startsWith('Bearer')
    ) {
      token = request.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    const decoded = tokenService.verifyAccessToken(token);

    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated.', 401));
    }

    request.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid token. Please log in again!', 401));
  }
};

const restrictTo = (...roles) => {
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

export { protect, restrictTo };