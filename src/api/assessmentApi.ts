import { apiClient } from './client';
import { storageService } from '../utils/storage';
import { Assessment } from '../types';

export const assessmentApi = {
  async getAll(): Promise<Assessment[]> {
    try {
      const res = await apiClient.get('/assessments');
      return res.data;
    } catch {
      return storageService.getAssessments();
    }
  },

  async getById(id: string): Promise<Assessment> {
    try {
      const res = await apiClient.get(`/assessments/${id}`);
      return res.data;
    } catch {
      const item = storageService.getAssessmentById(id);
      if (!item) throw new Error('Assessment not found');
      return item;
    }
  },

  async getByAccessCode(accessCode: string): Promise<Assessment> {
    try {
      const res = await apiClient.get(`/assessments/access/${accessCode}`);
      return res.data;
    } catch {
      const item = storageService.getAssessmentByAccessCode(accessCode);
      if (!item) throw new Error('Invalid assessment access code');
      return item;
    }
  },

  async create(data: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assessment> {
    try {
      const res = await apiClient.post('/assessments', data);
      return res.data;
    } catch {
      const newAssessment: Assessment = {
        ...data,
        id: `test-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return storageService.saveAssessment(newAssessment);
    }
  },

  async update(id: string, data: Partial<Assessment>): Promise<Assessment> {
    try {
      const res = await apiClient.put(`/assessments/${id}`, data);
      return res.data;
    } catch {
      const existing = storageService.getAssessmentById(id);
      if (!existing) throw new Error('Assessment not found');
      const updated = { ...existing, ...data };
      return storageService.saveAssessment(updated);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/assessments/${id}`);
    } catch {
      storageService.deleteAssessment(id);
    }
  },
};
