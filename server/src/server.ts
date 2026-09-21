import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/database';

const startServer = async () => {
  try {
    // Verify Database Connection
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database successfully.');

    const app = createApp();
    const port = env.PORT;

    const server = app.listen(port, () => {
      logger.info(`AssessPulse Server running in ${env.NODE_ENV} mode on port ${port}`);
      logger.info(`Swagger API Documentation available at: http://localhost:${port}/api/docs`);
      logger.info(`API Base URL: http://localhost:${port}/api/v1`);
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await prisma.$disconnect();
        logger.info('Database connection closed.');
        process.exit(0);
      });

      // Force exit if hanging
      setTimeout(() => {
        logger.error('Force shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
