export type UserRole = 'ADMIN' | 'TEST_CREATOR' | 'PARTICIPANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  createdAt: string;
}

export type QuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'LONG_ANSWER';

export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean; // Only visible in admin/grading mode or result review
}

export interface Question {
  id: string;
  assessmentId: string;
  text: string;
  type: QuestionType;
  options?: Option[];
  correctAnswers?: string[]; // Array of correct option IDs or text answers
  marks: number;
  explanation?: string;
  isRequired?: boolean;
  order: number;
}

export type AssessmentStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface AssessmentSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showImmediateResults: boolean;
  allowAnswerReview: boolean;
  maxAttempts: number;
  timeLimitMinutes: number; // 0 for unlimited
  passingScorePercentage: number;
  requireParticipantEmail: boolean;
  requireParticipantId: boolean;
  enableAntiCheatWarnings: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string;
  instructions?: string;
  accessCode: string;
  creatorId: string;
  creatorName?: string;
  status: AssessmentStatus;
  settings: AssessmentSettings;
  questionsCount?: number;
  totalMarks?: number;
  createdAt: string;
  updatedAt: string;
}

export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'ABANDONED';

export interface Answer {
  questionId: string;
  selectedOptionIds?: string[]; // For single/multiple choice & true/false
  textAnswer?: string; // For short & long answer
  isMarkedForReview?: boolean;
  isCorrect?: boolean;
  marksAwarded?: number;
  answeredAt?: string;
}

export interface ParticipantInfo {
  name: string;
  email: string;
  studentId?: string;
  organization?: string;
}

export interface Attempt {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  participant: ParticipantInfo;
  status: AttemptStatus;
  answers: Record<string, Answer>; // questionId -> Answer
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  totalMarks: number;
  earnedMarks: number;
  scorePercentage: number;
  isPassed: boolean;
  tabSwitchCount?: number;
}

export interface AssessmentAnalytics {
  assessmentId: string;
  totalAttempts: number;
  completedAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageTimeSpentSeconds: number;
  passRatePercentage: number;
  scoreDistribution: { range: string; count: number }[];
  attemptsTimeline: { date: string; attempts: number; avgScore: number }[];
  questionPerformance: {
    questionId: string;
    questionText: string;
    order: number;
    successRate: number;
    avgTimeSeconds: number;
  }[];
}

export interface ParticipantRecord {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  totalAttempts: number;
  passedAttempts: number;
  averageScore: number;
  lastAttemptDate: string;
  assessmentsTaken: {
    assessmentId: string;
    assessmentTitle: string;
    score: number;
    isPassed: boolean;
    date: string;
  }[];
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}
