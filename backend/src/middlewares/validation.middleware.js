import { validationResult } from 'express-validator';
import { AppError } from './errorHandler.middleware.js';

const validate = (validations) => {
  return async (request, response, next) => {
    await Promise.all(validations.map((validation) => validation.run(request)));

    const errors = validationResult(request);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map((error) => error.msg);
    return next(new AppError(errorMessages.join(', '), 400));
  };
};

export default validate;