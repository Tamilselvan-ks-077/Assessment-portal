import { Request, Response, NextFunction } from 'express';
import { ParticipantService } from '../services/participant.service';
import { sendSuccess } from '../utils/response';

const participantService = new ParticipantService();

export class ParticipantController {
  async getByAssessmentId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await participantService.getByAssessmentId(id);
      sendSuccess(res, result, 'Participants retrieved for assessment');
    } catch (error) {
      next(error);
    }
  }

  async registerParticipant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await participantService.registerParticipant(req.body);
      sendSuccess(res, result, 'Participant registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllParticipants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await participantService.getAllParticipants(req.query as any);
      sendSuccess(res, result.items, 'Participants retrieved');
    } catch (error) {
      next(error);
    }
  }
}
