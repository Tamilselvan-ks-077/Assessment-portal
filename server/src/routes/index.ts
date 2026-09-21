import { Router } from 'express';
import authRoutes from './auth.routes';
import assessmentRoutes from './assessment.routes';
import questionRoutes from './question.routes';
import publicRoutes from './public.routes';
import attemptRoutes from './attempt.routes';
import resultRoutes from './result.routes';
import participantRoutes from './participant.routes';
import userRoutes from './user.routes';

const apiRouter = Router();

// Base health route
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount modules
apiRouter.use('/auth', authRoutes);
apiRouter.use('/assessments', assessmentRoutes);
apiRouter.use('/questions', questionRoutes);
apiRouter.use('/public', publicRoutes);
apiRouter.use('/attempts', attemptRoutes);
apiRouter.use('/results', resultRoutes);
apiRouter.use('/participants', participantRoutes);
apiRouter.use('/users', userRoutes);

export default apiRouter;
