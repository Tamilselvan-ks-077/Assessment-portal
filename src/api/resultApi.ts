import { apiClient } from './client';
import { storageService } from '../utils/storage';
import { Attempt, Assessment, Question } from '../types';

export interface ResultDetails {
  attempt: Attempt;
  assessment: Assessment;
  questions?: Question[];
}

export const resultApi = {
  async getResult(attemptId: string): Promise<ResultDetails> {
    try {
      const res = await apiClient.get(`/results/${attemptId}`);
      return res.data;
    } catch {
      const attempt = storageService.getAttemptById(attemptId);
      if (!attempt) throw new Error('Attempt not found');

      const assessment = storageService.getAssessmentById(attempt.assessmentId);
      if (!assessment) throw new Error('Assessment not found');

      let questions: Question[] | undefined = undefined;
      if (assessment.settings.allowAnswerReview) {
        questions = storageService.getQuestionsByAssessmentId(assessment.id);
      }

      return {
        attempt,
        assessment,
        questions,
      };
    }
  },

  async getAssessmentAttempts(assessmentId: string): Promise<Attempt[]> {
    try {
      const res = await apiClient.get(`/assessments/${assessmentId}/attempts`);
      return res.data;
    } catch {
      return storageService.getAttemptsByAssessmentId(assessmentId);
    }
  },
};
