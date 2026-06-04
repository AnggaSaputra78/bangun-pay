import express from 'express';
import cookieParser from 'cookie-parser';
import env from './src/config/env.js';
import connectDatabase from './src/config/database.js';
import securityMiddlewares from './src/middlewares/security.middleware.js';
import requestLogger from './src/middlewares/requestLogger.middleware.js';
import { globalErrorHandler } from './src/middlewares/errorHandler.middleware.js';
import logger from './src/helpers/logger.js';
import routes from './src/routes/index.js';

const app = express();

await connectDatabase();

app.use(securityMiddlewares.helmet);
app.use(securityMiddlewares.cors);
app.use(securityMiddlewares.rateLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(securityMiddlewares.mongoSanitize);
app.use(securityMiddlewares.xssProtection);
app.use(securityMiddlewares.hpp);

app.use(requestLogger);

app.get('/health', (request, response) => {
  response.status(200).json({
    status: 'success',
    message: 'BangunPay API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1', routes);

app.use((request, response, next) => {
  const error = new Error(`Route ${request.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

app.use(globalErrorHandler);

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error);
  process.exit(1);
});