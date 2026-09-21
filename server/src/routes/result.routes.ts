import { Router } from 'express';
import { ResultController } from '../controllers/result.controller';
import { optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();
const resultController = new ResultController();

// GET /api/v1/results/:attemptId or /api/results/:attemptId
router.get(
  '/:attemptId',
  optionalAuthenticate,
  (req, res, next) => resultController.getAttemptResult(req, res, next)
);

export default router;
