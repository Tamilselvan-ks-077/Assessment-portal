import { apiClient } from './client';
import { storageService } from '../utils/storage';
import { Attempt, Answer, ParticipantInfo, Question } from '../types';

export interface StartAttemptPayload {
  accessCode: string;
  participant: ParticipantInfo;
}

export const attemptApi = {
  async startAttempt(payload: StartAttemptPayload): Promise<{ attempt: Attempt; questions: Question[] }> {
    try {
      const res = await apiClient.post('/attempts/start', payload);
      return res.data;
    } catch {
      const assessment = storageService.getAssessmentByAccessCode(payload.accessCode);
      if (!assessment) throw new Error('Assessment not found');

      const allQuestions = storageService.getQuestionsByAssessmentId(assessment.id);

      // Sanitized questions for participant (hide isCorrect and explanations during test)
      let candidateQuestions: Question[] = allQuestions.map((q) => ({
        ...q,
        options: q.options?.map((opt) => ({ id: opt.id, text: opt.text })),
        correctAnswers: undefined,
        explanation: undefined,
      }));

      if (assessment.settings.shuffleQuestions) {
        candidateQuestions = [...candidateQuestions].sort(() => Math.random() - 0.5);
      }

      if (assessment.settings.shuffleOptions) {
        candidateQuestions = candidateQuestions.map((q) => ({
          ...q,
          options: q.options ? [...q.options].sort(() => Math.random() - 0.5) : undefined,
        }));
      }

      const totalMarks = allQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

      const newAttempt: Attempt = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        participant: payload.participant,
        status: 'IN_PROGRESS',
        answers: {},
        startedAt: new Date().toISOString(),
        timeSpentSeconds: 0,
        totalMarks,
        earnedMarks: 0,
        scorePercentage: 0,
        isPassed: false,
        tabSwitchCount: 0,
      };

      storageService.saveAttempt(newAttempt);
      return { attempt: newAttempt, questions: candidateQuestions };
    }
  },

  async getAttempt(attemptId: string): Promise<Attempt> {
    try {
      const res = await apiClient.get(`/attempts/${attemptId}`);
      return res.data;
    } catch {
      const att = storageService.getAttemptById(attemptId);
      if (!att) throw new Error('Attempt not found');
      return att;
    }
  },

  async saveAnswer(attemptId: string, answer: Answer): Promise<Attempt> {
    try {
      const res = await apiClient.post(`/attempts/${attemptId}/answers`, answer);
      return res.data;
    } catch {
      const att = storageService.getAttemptById(attemptId);
      if (!att) throw new Error('Attempt not found');
      att.answers[answer.questionId] = {
        ...answer,
        answeredAt: new Date().toISOString(),
      };
      return storageService.saveAttempt(att);
    }
  },

  async recordTabSwitch(attemptId: string): Promise<void> {
    try {
      await apiClient.post(`/attempts/${attemptId}/tab-switch`);
    } catch {
      const att = storageService.getAttemptById(attemptId);
      if (att) {
        att.tabSwitchCount = (att.tabSwitchCount || 0) + 1;
        storageService.saveAttempt(att);
      }
    }
  },

  async submitAttempt(attemptId: string, timeSpentSeconds: number): Promise<Attempt> {
    try {
      const res = await apiClient.post(`/attempts/${attemptId}/submit`, { timeSpentSeconds });
      return res.data;
    } catch {
      const att = storageService.getAttemptById(attemptId);
      if (!att) throw new Error('Attempt not found');

      const assessment = storageService.getAssessmentById(att.assessmentId);
      const originalQuestions = storageService.getQuestionsByAssessmentId(att.assessmentId);

      let earnedMarks = 0;
      const gradedAnswers: Record<string, Answer> = {};

      originalQuestions.forEach((q) => {
        const candidateAns = att.answers[q.id];
        let isCorrect = false;
        let awarded = 0;

        if (candidateAns) {
          if (q.type === 'SINGLE_CHOICE' || q.type === 'TRUE_FALSE') {
            const chosen = candidateAns.selectedOptionIds?.[0];
            const correct = q.correctAnswers?.[0] || q.options?.find((o) => o.isCorrect)?.id;
            isCorrect = chosen === correct;
            awarded = isCorrect ? q.marks : 0;
          } else if (q.type === 'MULTIPLE_CHOICE') {
            const correctSet = new Set(
              q.correctAnswers || q.options?.filter((o) => o.isCorrect).map((o) => o.id) || []
            );
            const chosenSet = new Set(candidateAns.selectedOptionIds || []);
            const isMatch =
              correctSet.size === chosenSet.size &&
              [...correctSet].every((id) => chosenSet.has(id));
            isCorrect = isMatch;
            awarded = isMatch ? q.marks : 0;
          } else if (q.type === 'SHORT_ANSWER') {
            const text = (candidateAns.textAnswer || '').trim().toLowerCase();
            const keywords = (q.correctAnswers || []).map((k) => k.trim().toLowerCase());
            isCorrect = keywords.some((kw) => text.includes(kw)) || text.length > 3;
            awarded = isCorrect ? q.marks : Math.floor(q.marks * 0.5);
          } else {
            // LONG_ANSWER
            isCorrect = (candidateAns.textAnswer || '').trim().length > 10;
            awarded = isCorrect ? q.marks : 0;
          }

          gradedAnswers[q.id] = {
            ...candidateAns,
            isCorrect,
            marksAwarded: awarded,
          };
        } else {
          gradedAnswers[q.id] = {
            questionId: q.id,
            isCorrect: false,
            marksAwarded: 0,
          };
        }

        earnedMarks += awarded;
      });

      const totalMarks = originalQuestions.reduce((s, q) => s + (q.marks || 0), 0) || 1;
      const scorePercentage = Math.round((earnedMarks / totalMarks) * 100);
      const passingScore = assessment?.settings.passingScorePercentage || 70;
      const isPassed = scorePercentage >= passingScore;

      const finalized: Attempt = {
        ...att,
        status: 'COMPLETED',
        answers: gradedAnswers,
        submittedAt: new Date().toISOString(),
        timeSpentSeconds,
        totalMarks,
        earnedMarks,
        scorePercentage,
        isPassed,
      };

      return storageService.saveAttempt(finalized);
    }
  },
};
