import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export const logAudit = (action: string, entityType: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Attach listener to response finish event
    res.on('finish', async () => {
      if (res.statusCode < 400) {
        try {
          const userId = req.user?.userId || null;
          const entityId = req.params.id || req.params.questionId || req.params.attemptId || null;
          const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
          const userAgent = req.headers['user-agent'] || null;

          await prisma.auditLog.create({
            data: {
              userId,
              action,
              entityType,
              entityId,
              ipAddress: typeof ipAddress === 'string' ? ipAddress : null,
              userAgent,
              details: {
                method: req.method,
                path: req.originalUrl,
                params: req.params,
                query: req.query,
              },
            },
          });
        } catch (err: any) {
          logger.error('Failed to write audit log:', err.message);
        }
      }
    });

    next();
  };
};
