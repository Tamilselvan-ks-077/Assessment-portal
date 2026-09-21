import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import apiRouter from './routes';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/error.middleware';
import { NotFoundError } from './utils/errors';

export const createApp = (): Express => {
  const app = express();

  // Trust proxy in production or containers
  app.set('trust proxy', 1);

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows swagger UI assets
    })
  );

  // CORS Configuration
  const allowedOrigins = env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',');
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request body parsers with limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // Global Rate Limiter
  app.use('/api', globalRateLimiter);

  // Swagger Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Root Welcome & Health
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'AssessPulse Backend API',
      version: '1.0.0',
      status: 'operational',
      docs: '/api/docs',
      apiPrefix: '/api/v1',
    });
  });

  // Mount API Routers (v1 and base /api for compatibility)
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // 404 Catch-All
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};
