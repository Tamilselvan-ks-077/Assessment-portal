import { Request, Response, NextFunction } from 'express';
import { QuestionService } from '../services/question.service';
import { sendSuccess } from '../utils/response';

const questionService = new QuestionService();

export class QuestionController {
  async getByAssessmentId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      const result = await questionService.getByAssessmentId(id, user);
      sendSuccess(res, result, 'Questions retrieved');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      const result = await questionService.create(id, req.body, user);
      sendSuccess(res, result, 'Question created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const questionId = req.params.questionId || req.params.id;
      const user = req.user!;
      const result = await questionService.update(questionId, req.body, user);
      sendSuccess(res, result, 'Question updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const questionId = req.params.questionId || req.params.id;
      const user = req.user!;
      const result = await questionService.delete(questionId, user);
      sendSuccess(res, result, 'Question deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      const result = await questionService.reorder(id, req.body, user);
      sendSuccess(res, result, 'Questions reordered successfully');
    } catch (error) {
      next(error);
    }
  }
}
