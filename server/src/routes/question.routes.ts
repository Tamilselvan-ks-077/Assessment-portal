import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { logAudit } from '../middleware/audit.middleware';
import { updateQuestionSchema } from '../validators/question.validator';

const router = Router();
const questionController = new QuestionController();

router.patch(
  '/:questionId',
  authenticate,
  requireRoles('ADMIN', 'TEST_CREATOR'),
  validate(updateQuestionSchema),
  logAudit('UPDATE', 'QUESTION'),
  (req, res, next) => questionController.update(req, res, next)
);

router.put(
  '/:questionId',
  authenticate,
  requireRoles('ADMIN', 'TEST_CREATOR'),
  validate(updateQuestionSchema),
  logAudit('UPDATE', 'QUESTION'),
  (req, res, next) => questionController.update(req, res, next)
);

router.delete(
  '/:questionId',
  authenticate,
  requireRoles('ADMIN', 'TEST_CREATOR'),
  logAudit('DELETE', 'QUESTION'),
  (req, res, next) => questionController.delete(req, res, next)
);

export default router;
