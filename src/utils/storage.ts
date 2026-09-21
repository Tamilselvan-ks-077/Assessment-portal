import {
  Assessment,
  Question,
  Attempt,
  User,
  ParticipantRecord,
  AssessmentAnalytics,
} from '../types';
import { INITIAL_ASSESSMENTS, INITIAL_QUESTIONS, DEMO_USERS } from '../constants';

const STORAGE_KEYS = {
  USERS: 'assesspulse_users',
  CURRENT_USER: 'assesspulse_current_user',
  TOKEN: 'assesspulse_token',
  ASSESSMENTS: 'assesspulse_assessments',
  QUESTIONS: 'assesspulse_questions',
  ATTEMPTS: 'assesspulse_attempts',
};

// Initialize default seed data if absent
export function initSeedData() {
  if (!localStorage.getItem(STORAGE_KEYS.ASSESSMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(INITIAL_ASSESSMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
    // Generate some initial seed attempts for demo analytics
    const seedAttempts: Attempt[] = [
      {
        id: 'att-seed-1',
        assessmentId: 'test-fe-mastery',
        assessmentTitle: 'Frontend React & Modern Web Mastery',
        participant: {
          name: 'David Kim',
          email: 'david.kim@example.com',
          studentId: 'ST-9021',
        },
        status: 'COMPLETED',
        answers: {
          'q-fe-1': { questionId: 'q-fe-1', selectedOptionIds: ['opt-2'], isCorrect: true, marksAwarded: 5 },
          'q-fe-2': { questionId: 'q-fe-2', selectedOptionIds: ['opt-21', 'opt-23'], isCorrect: true, marksAwarded: 5 },
          'q-fe-3': { questionId: 'q-fe-3', selectedOptionIds: ['opt-tf-2'], isCorrect: true, marksAwarded: 5 },
          'q-fe-4': { questionId: 'q-fe-4', textAnswer: 'useLayoutEffect is synchronous before paint, useEffect is async after paint.', isCorrect: true, marksAwarded: 5 },
          'q-fe-5': { questionId: 'q-fe-5', textAnswer: 'Use react-window virtualization to only render visible rows.', isCorrect: true, marksAwarded: 4 },
        },
        startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        submittedAt: new Date(Date.now() - 86400000 * 2 + 580000).toISOString(),
        timeSpentSeconds: 580,
        totalMarks: 25,
        earnedMarks: 24,
        scorePercentage: 96,
        isPassed: true,
      },
      {
        id: 'att-seed-2',
        assessmentId: 'test-fe-mastery',
        assessmentTitle: 'Frontend React & Modern Web Mastery',
        participant: {
          name: 'Elena Rostova',
          email: 'elena.r@example.com',
          studentId: 'ST-9044',
        },
        status: 'COMPLETED',
        answers: {
          'q-fe-1': { questionId: 'q-fe-1', selectedOptionIds: ['opt-2'], isCorrect: true, marksAwarded: 5 },
          'q-fe-2': { questionId: 'q-fe-2', selectedOptionIds: ['opt-21'], isCorrect: false, marksAwarded: 2 },
          'q-fe-3': { questionId: 'q-fe-3', selectedOptionIds: ['opt-tf-2'], isCorrect: true, marksAwarded: 5 },
          'q-fe-4': { questionId: 'q-fe-4', textAnswer: 'One is async and one is sync.', isCorrect: true, marksAwarded: 4 },
          'q-fe-5': { questionId: 'q-fe-5', textAnswer: 'Virtual scrolling and pagination.', isCorrect: true, marksAwarded: 3 },
        },
        startedAt: new Date(Date.now() - 86400000).toISOString(),
        submittedAt: new Date(Date.now() - 86400000 + 720000).toISOString(),
        timeSpentSeconds: 720,
        totalMarks: 25,
        earnedMarks: 19,
        scorePercentage: 76,
        isPassed: true,
      },
      {
        id: 'att-seed-3',
        assessmentId: 'test-fe-mastery',
        assessmentTitle: 'Frontend React & Modern Web Mastery',
        participant: {
          name: 'Marcus Vance',
          email: 'marcus.vance@example.com',
          studentId: 'ST-8812',
        },
        status: 'COMPLETED',
        answers: {
          'q-fe-1': { questionId: 'q-fe-1', selectedOptionIds: ['opt-1'], isCorrect: false, marksAwarded: 0 },
          'q-fe-2': { questionId: 'q-fe-2', selectedOptionIds: ['opt-22'], isCorrect: false, marksAwarded: 0 },
          'q-fe-3': { questionId: 'q-fe-3', selectedOptionIds: ['opt-tf-1'], isCorrect: false, marksAwarded: 0 },
          'q-fe-4': { questionId: 'q-fe-4', textAnswer: 'Not sure about layout effect.', isCorrect: false, marksAwarded: 0 },
          'q-fe-5': { questionId: 'q-fe-5', textAnswer: 'Use CSS', isCorrect: false, marksAwarded: 1 },
        },
        startedAt: new Date(Date.now() - 43200000).toISOString(),
        submittedAt: new Date(Date.now() - 43200000 + 400000).toISOString(),
        timeSpentSeconds: 400,
        totalMarks: 25,
        earnedMarks: 1,
        scorePercentage: 4,
        isPassed: false,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(seedAttempts));
  }
}

// User & Auth storage
export const storageService = {
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, `token_${user.id}_${Date.now()}`);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  },

  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : DEMO_USERS;
  },

  // Assessments
  getAssessments(): Assessment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
    const list: Assessment[] = raw ? JSON.parse(raw) : INITIAL_ASSESSMENTS;
    const questionsMap = this.getAllQuestionsMap();

    // dynamically enrich questionsCount & totalMarks
    return list.map((a) => {
      const qList = questionsMap[a.id] || [];
      const totalMarks = qList.reduce((sum, q) => sum + (q.marks || 0), 0);
      return {
        ...a,
        questionsCount: qList.length,
        totalMarks,
      };
    });
  },

  getAssessmentById(id: string): Assessment | null {
    const all = this.getAssessments();
    return all.find((a) => a.id === id) || null;
  },

  getAssessmentByAccessCode(code: string): Assessment | null {
    const all = this.getAssessments();
    const cleanCode = code.trim().toUpperCase();
    return all.find((a) => a.accessCode.toUpperCase() === cleanCode) || null;
  },

  syncAssessmentMetrics(assessmentId: string) {
    const rawAsms = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
    if (!rawAsms) return;
    const list: Assessment[] = JSON.parse(rawAsms);
    const qMap = this.getAllQuestionsMap();
    const qList = qMap[assessmentId] || [];
    const totalMarks = qList.reduce((sum, q) => sum + (q.marks || 0), 0);

    const updated = list.map((a) => {
      if (a.id === assessmentId) {
        return {
          ...a,
          questionsCount: qList.length,
          totalMarks,
          updatedAt: new Date().toISOString(),
        };
      }
      return a;
    });
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(updated));
  },

  saveAssessment(assessment: Assessment): Assessment {
    const all = this.getAssessments();
    const idx = all.findIndex((a) => a.id === assessment.id);
    const qMap = this.getAllQuestionsMap();
    const qList = qMap[assessment.id] || [];
    const totalMarks = qList.reduce((sum, q) => sum + (q.marks || 0), 0);

    const enrichedAssessment: Assessment = {
      ...assessment,
      questionsCount: qList.length > 0 ? qList.length : (assessment.questionsCount || 0),
      totalMarks: totalMarks > 0 ? totalMarks : (assessment.totalMarks || 0),
    };

    let updated: Assessment[];
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = { ...enrichedAssessment, updatedAt: new Date().toISOString() };
    } else {
      updated = [
        {
          ...enrichedAssessment,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...all,
      ];
    }
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(updated));
    return enrichedAssessment;
  },

  deleteAssessment(id: string): boolean {
    const all = this.getAssessments();
    const filtered = all.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(filtered));

    // Also remove questions associated
    const qMap = this.getAllQuestionsMap();
    delete qMap[id];
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(qMap));
    return true;
  },

  // Questions
  getAllQuestionsMap(): Record<string, Question[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return raw ? JSON.parse(raw) : INITIAL_QUESTIONS;
  },

  getQuestionsByAssessmentId(assessmentId: string): Question[] {
    const map = this.getAllQuestionsMap();
    return (map[assessmentId] || []).sort((a, b) => a.order - b.order);
  },

  saveQuestion(question: Question): Question {
    const map = this.getAllQuestionsMap();
    const list = map[question.assessmentId] || [];
    const idx = list.findIndex((q) => q.id === question.id);

    if (idx >= 0) {
      list[idx] = question;
    } else {
      list.push({ ...question, order: list.length + 1 });
    }
    map[question.assessmentId] = list;
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(map));
    this.syncAssessmentMetrics(question.assessmentId);
    return question;
  },

  saveQuestionsBulk(assessmentId: string, questions: Question[]): Question[] {
    const map = this.getAllQuestionsMap();
    map[assessmentId] = questions.map((q, idx) => ({ ...q, order: idx + 1 }));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(map));
    this.syncAssessmentMetrics(assessmentId);
    return map[assessmentId];
  },

  deleteQuestion(assessmentId: string, questionId: string): boolean {
    const map = this.getAllQuestionsMap();
    const list = map[assessmentId] || [];
    map[assessmentId] = list
      .filter((q) => q.id !== questionId)
      .map((q, idx) => ({ ...q, order: idx + 1 }));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(map));
    this.syncAssessmentMetrics(assessmentId);
    return true;
  },

  // Attempts
  getAttempts(): Attempt[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return raw ? JSON.parse(raw) : [];
  },

  getAttemptById(id: string): Attempt | null {
    const attempts = this.getAttempts();
    return attempts.find((a) => a.id === id) || null;
  },

  getAttemptsByAssessmentId(assessmentId: string): Attempt[] {
    const attempts = this.getAttempts();
    return attempts
      .filter((a) => a.assessmentId === assessmentId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  },

  saveAttempt(attempt: Attempt): Attempt {
    const all = this.getAttempts();
    const idx = all.findIndex((a) => a.id === attempt.id);
    let updated: Attempt[];
    if (idx >= 0) {
      updated = [...all];
      updated[idx] = attempt;
    } else {
      updated = [attempt, ...all];
    }
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(updated));
    return attempt;
  },

  // Participants & Analytics dynamically calculated
  getParticipants(): ParticipantRecord[] {
    const attempts = this.getAttempts();
    const map: Record<string, ParticipantRecord> = {};

    attempts.forEach((att) => {
      const email = att.participant.email.toLowerCase();
      if (!map[email]) {
        map[email] = {
          id: `p-${email}`,
          name: att.participant.name,
          email: att.participant.email,
          studentId: att.participant.studentId,
          totalAttempts: 0,
          passedAttempts: 0,
          averageScore: 0,
          lastAttemptDate: att.startedAt,
          assessmentsTaken: [],
        };
      }

      const p = map[email];
      p.totalAttempts += 1;
      if (att.isPassed) p.passedAttempts += 1;
      p.assessmentsTaken.push({
        assessmentId: att.assessmentId,
        assessmentTitle: att.assessmentTitle,
        score: att.scorePercentage,
        isPassed: att.isPassed,
        date: att.submittedAt || att.startedAt,
      });

      if (new Date(att.startedAt) > new Date(p.lastAttemptDate)) {
        p.lastAttemptDate = att.startedAt;
      }
    });

    return Object.values(map).map((p) => {
      const avg = p.assessmentsTaken.reduce((s, i) => s + i.score, 0) / (p.assessmentsTaken.length || 1);
      return {
        ...p,
        averageScore: Math.round(avg),
      };
    });
  },

  getAssessmentAnalytics(assessmentId: string): AssessmentAnalytics {
    const attempts = this.getAttemptsByAssessmentId(assessmentId);
    const questions = this.getQuestionsByAssessmentId(assessmentId);

    const completed = attempts.filter((a) => a.status === 'COMPLETED');
    const total = attempts.length;
    const passed = completed.filter((a) => a.isPassed).length;
    const failed = completed.length - passed;

    const scores = completed.map((a) => a.scorePercentage);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const high = scores.length ? Math.max(...scores) : 0;
    const low = scores.length ? Math.min(...scores) : 0;

    const times = completed.map((a) => a.timeSpentSeconds);
    const avgTime = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    const passRate = completed.length ? Math.round((passed / completed.length) * 100) : 0;

    // score distribution buckets
    const buckets = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 },
    ];
    scores.forEach((s) => {
      if (s <= 20) buckets[0].count++;
      else if (s <= 40) buckets[1].count++;
      else if (s <= 60) buckets[2].count++;
      else if (s <= 80) buckets[3].count++;
      else buckets[4].count++;
    });

    // Timeline
    const dateMap: Record<string, { count: number; totalScore: number }> = {};
    attempts.forEach((a) => {
      const d = a.startedAt.slice(0, 10);
      if (!dateMap[d]) dateMap[d] = { count: 0, totalScore: 0 };
      dateMap[d].count += 1;
      dateMap[d].totalScore += a.scorePercentage;
    });

    const timeline = Object.keys(dateMap).sort().map((d) => ({
      date: d,
      attempts: dateMap[d].count,
      avgScore: Math.round(dateMap[d].totalScore / dateMap[d].count),
    }));

    // Question performance
    const qPerf = questions.map((q) => {
      let correctCount = 0;
      let answeredCount = 0;
      completed.forEach((att) => {
        const ans = att.answers[q.id];
        if (ans) {
          answeredCount++;
          if (ans.isCorrect) correctCount++;
        }
      });
      const successRate = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;
      return {
        questionId: q.id,
        questionText: q.text,
        order: q.order,
        successRate,
        avgTimeSeconds: Math.floor(avgTime / (questions.length || 1)),
      };
    });

    return {
      assessmentId,
      totalAttempts: total,
      completedAttempts: completed.length,
      passedAttempts: passed,
      failedAttempts: failed,
      averageScore: avgScore,
      highestScore: high,
      lowestScore: low,
      averageTimeSpentSeconds: avgTime,
      passRatePercentage: passRate,
      scoreDistribution: buckets,
      attemptsTimeline: timeline.length ? timeline : [{ date: 'Today', attempts: total, avgScore }],
      questionPerformance: qPerf,
    };
  },
};
