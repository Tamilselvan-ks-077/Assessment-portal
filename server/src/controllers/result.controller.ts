import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/response';

const analyticsService = new AnalyticsService();

export class ResultController {
  async getAssessmentResults(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user;
      const result = await analyticsService.getAssessmentResults(id, user);
      sendSuccess(res, result, 'Assessment results retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getAttemptResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attemptId = req.params.attemptId || req.params.id;
      const result = await analyticsService.getAttemptResult(attemptId);
      sendSuccess(res, result, 'Attempt result retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getAssessmentAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user;
      const result = await analyticsService.getAssessmentAnalytics(id, user);
      sendSuccess(res, result, 'Assessment analytics retrieved');
    } catch (error) {
      next(error);
    }
  }
}
