import { Request, Response, NextFunction } from 'express';
import { AttemptService } from '../services/attempt.service';
import { sendSuccess } from '../utils/response';

const attemptService = new AttemptService();

export class AttemptController {
  async getPublicTestInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accessCode } = req.params;
      const result = await attemptService.getPublicTestInfo(accessCode);
      sendSuccess(res, result, 'Public test info retrieved');
    } catch (error) {
      next(error);
    }
  }

  async startAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessCode = req.params.accessCode || req.body.accessCode;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await attemptService.startAttempt(
        { ...req.body, accessCode },
        { ipAddress, userAgent }
      );
      sendSuccess(res, result, 'Assessment attempt started', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attemptId = req.params.attemptId || req.params.id;
      const result = await attemptService.getAttempt(attemptId);
      sendSuccess(res, result, 'Attempt details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async saveAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attemptId = req.params.attemptId || req.params.id;
      const result = await attemptService.saveAnswer(attemptId, req.body);
      sendSuccess(res, result, 'Answer saved successfully');
    } catch (error) {
      next(error);
    }
  }

  async recordTabSwitch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attemptId = req.params.attemptId || req.params.id;
      const result = await attemptService.recordTabSwitch(attemptId);
      sendSuccess(res, result, 'Tab switch recorded');
    } catch (error) {
      next(error);
    }
  }

  async submitAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attemptId = req.params.attemptId || req.params.id;
      const result = await attemptService.submitAttempt(attemptId, req.body);
      sendSuccess(res, result, 'Assessment attempt submitted and graded successfully');
    } catch (error) {
      next(error);
    }
  }
}
