import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { prisma } from '../config/database';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        name?: string;
        organization?: string | null;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid format');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authentication token missing');
    }

    const decoded = verifyAccessToken(token);
    
    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true, organization: true },
    });

    if (!user) {
      throw new UnauthorizedError('User associated with this token no longer exists');
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      organization: user.organization,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token has expired'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token signature'));
    } else {
      next(error);
    }
  }
};

export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, role: true, name: true, organization: true },
        });
        if (user) {
          req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            organization: user.organization,
          };
        }
      }
    }
    next();
  } catch {
    next();
  }
};
