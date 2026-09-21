import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateUserSchema } from '../validators/user.validator';
import { logAudit } from '../middleware/audit.middleware';

const router = Router();
const userController = new UserController();

router.get(
  '/me',
  authenticate,
  (req, res, next) => userController.getProfile(req, res, next)
);

router.patch(
  '/me',
  authenticate,
  validate(updateUserSchema),
  logAudit('UPDATE_PROFILE', 'USER'),
  (req, res, next) => userController.updateProfile(req, res, next)
);

router.put(
  '/me',
  authenticate,
  validate(updateUserSchema),
  logAudit('UPDATE_PROFILE', 'USER'),
  (req, res, next) => userController.updateProfile(req, res, next)
);

export default router;
