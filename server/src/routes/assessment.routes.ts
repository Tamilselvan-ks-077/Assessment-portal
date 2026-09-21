import { Router } from 'express';
import { AssessmentController } from '../controllers/assessment.controller';
import { QuestionController } from '../controllers/question.controller';
import { ResultController } from '../controllers/result.controller';
import { ParticipantController } from '../controllers/participant.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate, validateQuery } from '../middleware/validate.middleware';
import { logAudit } from '../middleware/audit.middleware';
import {
  createAssessmentSchema,
  updateAssessmentSchema,
  assessmentQuerySchema,
} from '../validators/assessment.validator';
import {
  createQuestionSchema,
  reorderQuestionsSchema,
} from '../validators/question.validator';

const router = Router();
const assessmentController = new AssessmentController();
const questionController = new QuestionController();
const resultController = new ResultController();
const participantController = new ParticipantController();

// GET all assessments (authenticated)
router.get(
  '/',
  authenticate,
  validateQuery(assessmentQuerySchema),
  (req, res, next) => assessmentController.getAll(req, res, next)
);

// POST create assessment (ADMIN or TEST_CREATOR)
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'TEST_CREATOR'),
  validate(createAssessmentSchema),
  logAudit('CREATE', 'ASSESSMENT'),
  (req, res, next) => assessmentController.create(req, res, next)
);

// GET assessment by access code (public/candidate preview)
router.get(
  '/access/:accessCode',
  (req, res, next) => assessmentController.getByAccessCode(req, res, next)
);

// GET assessment by id
router.get(
  '/:id',
  optionalAuthenticate,
  (req, res, next) => assessmentController.getById(req, res, next)
);

// PATCH / PUT update assessment
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'TEST_CREATOR'),
  validate(updateAssessmentSchema),
  logAudit('UPDATE', 'ASSESSMENT'),
  (req, res, next) => assessmentController.update(req, res, next)
);

router.put(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'TEST_CREATOR'),
  validate(updateAssessmentSchema),
  logAudit('UPDATE', 'ASSESSMENT'),
  (req, res, next) => assessmentController.update(req, res, next)
);

// DELETE assessment
router.delete(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'TEST_CREATOR'),
  logAudit('DELETE', 'ASSESSMENT'),
  (req, res, next) => assessmentController.delete(req, res, next)
);

// POST publish assessment
router.post(
  '/:id/publish',
  authenticate,
  requireRoles('ADMIN', 'TEST_CREATOR'),
  logAudit('PUBLISH', 'ASSESSMENT'),
  (req, res, next) => assessmentController.publish(req, res, next)
);

// POST close assessment
router.post(
  '/:id/close',
  authenticate,
  requireRoles('ADMIN', 'TEST_CREATOR'),
  logAudit('CLOSE', 'ASSESSMENT'),
  (req, res, next) => assessmentController.close(req, res, next)
);

// NESTED QUESTION ROUTES
router.get(
  '/:id/questions',
  authenticate,
  (req, res, next) => questionController.getByAssessmentId(req, res, next)
);

router.post(
  '/:id/questions',
  authenticate,
  requireRoles('ADMIN', 'TEST_CREATOR'),
  validate(createQuestionSchema),
  logAudit('CREATE', 'QUESTION'),
  (req, res, next) => questionController.create(req, res, next)
);

router.put(
  '/:id/questions/reorder',
  authenticate,
  requireRoles('ADMIN', 'TEST_CREATOR'),
  validate(reorderQuestionsSchema),
  (req, res, next) => questionController.reorder(req, res, next)
);

router.delete(
  '/:id/questions/:questionId',
  authenticate,
  requireRoles('ADMIN', 'TEST_CREATOR'),
  logAudit('DELETE', 'QUESTION'),
  (req, res, next) => questionController.delete(req, res, next)
);

// NESTED RESULTS & ANALYTICS
router.get(
  '/:id/results',
  authenticate,
  (req, res, next) => resultController.getAssessmentResults(req, res, next)
);

router.get(
  '/:id/attempts',
  authenticate,
  (req, res, next) => resultController.getAssessmentResults(req, res, next)
);

router.get(
  '/:id/analytics',
  authenticate,
  (req, res, next) => resultController.getAssessmentAnalytics(req, res, next)
);

// NESTED PARTICIPANTS
router.get(
  '/:id/participants',
  authenticate,
  (req, res, next) => participantController.getByAssessmentId(req, res, next)
);

router.post(
  '/:id/participants',
  (req, res, next) => participantController.registerParticipant(req, res, next)
);

export default router;
