import { Router } from 'express';
import { ParticipantController } from '../controllers/participant.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';

const router = Router();
const participantController = new ParticipantController();

// GET all participants (ADMIN or TEST_CREATOR)
router.get(
  '/',
  authenticate,
  requireRoles('ADMIN', 'TEST_CREATOR'),
  (req, res, next) => participantController.getAllParticipants(req, res, next)
);

export default router;
