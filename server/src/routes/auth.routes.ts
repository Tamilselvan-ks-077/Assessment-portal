import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import { logAudit } from '../middleware/audit.middleware';

const router = Router();
const authController = new AuthController();

router.post('/register', authRateLimiter, validate(registerSchema), logAudit('REGISTER', 'USER'), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', authRateLimiter, validate(loginSchema), logAudit('LOGIN', 'USER'), (req, res, next) =>
  authController.login(req, res, next)
);

router.post('/refresh', validate(refreshTokenSchema), (req, res, next) =>
  authController.refresh(req, res, next)
);

router.post('/logout', authenticate, logAudit('LOGOUT', 'USER'), (req, res, next) =>
  authController.logout(req, res, next)
);

router.get('/me', authenticate, (req, res, next) =>
  authController.me(req, res, next)
);

export default router;
