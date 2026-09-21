import { apiClient } from './client';
import { storageService } from '../utils/storage';
import { Question } from '../types';

export const questionApi = {
  async getByAssessmentId(assessmentId: string): Promise<Question[]> {
    try {
      const res = await apiClient.get(`/assessments/${assessmentId}/questions`);
      return res.data;
    } catch {
      return storageService.getQuestionsByAssessmentId(assessmentId);
    }
  },

  async create(assessmentId: string, question: Omit<Question, 'id'>): Promise<Question> {
    try {
      const res = await apiClient.post(`/assessments/${assessmentId}/questions`, question);
      return res.data;
    } catch {
      const newQuestion: Question = {
        ...question,
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        assessmentId,
      };
      return storageService.saveQuestion(newQuestion);
    }
  },

  async update(question: Question): Promise<Question> {
    try {
      const res = await apiClient.put(`/questions/${question.id}`, question);
      return res.data;
    } catch {
      return storageService.saveQuestion(question);
    }
  },

  async delete(assessmentId: string, questionId: string): Promise<void> {
    try {
      await apiClient.delete(`/assessments/${assessmentId}/questions/${questionId}`);
    } catch {
      storageService.deleteQuestion(assessmentId, questionId);
    }
  },

  async saveOrder(assessmentId: string, questions: Question[]): Promise<Question[]> {
    try {
      const res = await apiClient.put(`/assessments/${assessmentId}/questions/reorder`, { questions });
      return res.data;
    } catch {
      return storageService.saveQuestionsBulk(assessmentId, questions);
    }
  },
};
