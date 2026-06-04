import env from '../config/env.js';
import logger from '../helpers/logger.js';

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (error, request, response) => {
  if (request.originalUrl.startsWith('/api')) {
    return response.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  }
};

const sendErrorProd = (error, request, response) => {
  if (request.originalUrl.startsWith('/api')) {
    if (error.isOperational) {
      return response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }

    logger.error('ERROR 💥', error);
    return response.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

const globalErrorHandler = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (env.NODE_ENV === 'development') {
    sendErrorDev(error, request, response);
  } else {
    let errorCopy = { ...error };
    errorCopy.message = error.message;

    if (errorCopy.name === 'CastError') errorCopy = handleCastErrorDB(errorCopy);
    if (errorCopy.code === 11000) errorCopy = handleDuplicateFieldsDB(errorCopy);
    if (errorCopy.name === 'ValidationError')
      errorCopy = handleValidationErrorDB(errorCopy);
    if (errorCopy.name === 'JsonWebTokenError') errorCopy = handleJWTError();
    if (errorCopy.name === 'TokenExpiredError') errorCopy = handleJWTExpiredError();

    sendErrorProd(errorCopy, request, response);
  }
};

export { AppError, globalErrorHandler };