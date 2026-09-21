import { Request, Response, NextFunction } from 'express';
import { AssessmentService } from '../services/assessment.service';
import { sendSuccess } from '../utils/response';

const assessmentService = new AssessmentService();

export class AssessmentController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const result = await assessmentService.getAll(req.query as any, user);
      sendSuccess(res, result.items, 'Assessments retrieved', 200);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user;
      const result = await assessmentService.getById(id, user);
      sendSuccess(res, result, 'Assessment retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getByAccessCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accessCode } = req.params;
      const result = await assessmentService.getByAccessCode(accessCode);
      sendSuccess(res, result, 'Assessment retrieved by access code');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await assessmentService.create(req.body, userId);
      sendSuccess(res, result, 'Assessment created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      const result = await assessmentService.update(id, req.body, user);
      sendSuccess(res, result, 'Assessment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async publish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      const result = await assessmentService.publish(id, user);
      sendSuccess(res, result, 'Assessment published successfully');
    } catch (error) {
      next(error);
    }
  }

  async close(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      const result = await assessmentService.close(id, user);
      sendSuccess(res, result, 'Assessment closed successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      const result = await assessmentService.delete(id, user);
      sendSuccess(res, result, 'Assessment deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
