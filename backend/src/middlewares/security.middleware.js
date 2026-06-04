import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cors from 'cors';
import env from '../config/env.js';

const securityMiddlewares = {
  helmet: helmet(),

  cors: cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),

  rateLimiter: rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      status: 'error',
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  mongoSanitize: mongoSanitize(),

  hpp: hpp(),

  xssProtection: (request, response, next) => {
    const sanitize = (obj) => {
      if (typeof obj === 'string') {
        return obj
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj !== null && typeof obj === 'object') {
        const sanitizedObj = {};
        for (const key in obj) {
          sanitizedObj[key] = sanitize(obj[key]);
        }
        return sanitizedObj;
      }
      return obj;
    };

    if (request.body) request.body = sanitize(request.body);
    if (request.query) request.query = sanitize(request.query);
    if (request.params) request.params = sanitize(request.params);

    next();
  },
};

export default securityMiddlewares;