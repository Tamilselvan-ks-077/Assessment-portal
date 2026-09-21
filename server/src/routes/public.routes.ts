import { Router } from 'express';
import { AttemptController } from '../controllers/attempt.controller';
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

// GET public test landing info (title, description, duration, rules, etc.)
router.get(
  '/tests/:accessCode',
  (req, res, next) => attemptController.getPublicTestInfo(req, res, next)
);

// POST start test by accessCode
router.post(
  '/tests/:accessCode/start',
  testAttemptRateLimiter,
  validate(startAttemptSchema),
  logAudit('START_ATTEMPT', 'ASSESSMENT_ATTEMPT'),
  (req, res, next) => attemptController.startAttempt(req, res, next)
);

// GET attempt status
router.get(
  '/attempts/:attemptId',
  (req, res, next) => attemptController.getAttempt(req, res, next)
);

// POST save answers during test
router.post(
  '/attempts/:attemptId/answers',
  testAttemptRateLimiter,
  validate(saveAnswerSchema),
  (req, res, next) => attemptController.saveAnswer(req, res, next)
);

// POST submit attempt
router.post(
  '/attempts/:attemptId/submit',
  testAttemptRateLimiter,
  validate(submitAttemptSchema),
  logAudit('SUBMIT_ATTEMPT', 'ASSESSMENT_ATTEMPT'),
  (req, res, next) => attemptController.submitAttempt(req, res, next)
);

// POST record tab switch
router.post(
  '/attempts/:attemptId/tab-switch',
  (req, res, next) => attemptController.recordTabSwitch(req, res, next)
);

export default router;
