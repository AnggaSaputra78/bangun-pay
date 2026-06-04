import logger from '../helpers/logger.js';

const requestLogger = (request, response, next) => {
  const start = Date.now();

  response.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: request.method,
      url: request.originalUrl,
      status: response.statusCode,
      duration: `${duration}ms`,
      ip: request.ip,
      userAgent: request.get('user-agent'),
      userId: request.user?.id || 'unauthenticated',
    };

    if (response.statusCode >= 400) {
      logger.warn('Request failed', logData);
    } else {
      logger.info('Request successful', logData);
    }
  });

  next();
};

export default requestLogger;