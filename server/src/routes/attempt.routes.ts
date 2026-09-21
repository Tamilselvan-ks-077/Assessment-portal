import { Router } from 'express';
import { AttemptController } from '../controllers/attempt.controller';
import { ResultController } from '../controllers/result.controller';
import { validate } from '../middleware/validate.middleware';
import { testAttemptRateLimiter } from '../middleware/rateLimiter.middleware';
import {
  startAttemptSchema,
  saveAnswerSchema,
  submitAttemptSchema,
} from '../validators/attempt.validator';
import { logAudit } from '../middleware/audit.middleware';

const router = Router();
const attemptController = new AttemptController();
const resultController = new ResultController();

// POST /api/attempts/start
router.post(
  '/start',
  testAttemptRateLimiter,
  validate(startAttemptSchema),
  logAudit('START_ATTEMPT', 'ASSESSMENT_ATTEMPT'),
  (req, res, next) => attemptController.startAttempt(req, res, next)
);

// GET /api/attempts/:attemptId
router.get(
  '/:attemptId',
  (req, res, next) => attemptController.getAttempt(req, res, next)
);

// POST /api/attempts/:attemptId/answers
router.post(
  '/:attemptId/answers',
  testAttemptRateLimiter,
  validate(saveAnswerSchema),
  (req, res, next) => attemptController.saveAnswer(req, res, next)
);

// POST /api/attempts/:attemptId/tab-switch
router.post(
  '/:attemptId/tab-switch',
  (req, res, next) => attemptController.recordTabSwitch(req, res, next)
);

// POST /api/attempts/:attemptId/submit
router.post(
  '/:attemptId/submit',
  testAttemptRateLimiter,
  validate(submitAttemptSchema),
  logAudit('SUBMIT_ATTEMPT', 'ASSESSMENT_ATTEMPT'),
  (req, res, next) => attemptController.submitAttempt(req, res, next)
);

// GET /api/attempts/:attemptId/result
router.get(
  '/:attemptId/result',
  (req, res, next) => resultController.getAttemptResult(req, res, next)
);

export default router;
