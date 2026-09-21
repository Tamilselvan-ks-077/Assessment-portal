import { AttemptRepository } from '../repositories/attempt.repository';
import { AssessmentRepository } from '../repositories/assessment.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class AnalyticsService {
  private attemptRepo: AttemptRepository;
  private assessmentRepo: AssessmentRepository;

  constructor() {
    this.attemptRepo = new AttemptRepository();
    this.assessmentRepo = new AssessmentRepository();
  }

  async getAssessmentResults(assessmentId: string, user?: { userId: string; role: string }) {
    const assessment = await this.assessmentRepo.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }

    if (user && user.role !== 'ADMIN' && assessment.creatorId !== user.userId) {
      throw new ForbiddenError('You do not have permission to view results for this assessment');
    }

    const attempts = await this.attemptRepo.findManyByAssessmentId(assessmentId);

    return attempts.map((att) => ({
      id: att.id,
      assessmentId: att.assessmentId,
      assessmentTitle: assessment.title,
      participant: {
        id: att.participant.id,
        name: att.participant.name,
        email: att.participant.email,
        studentId: att.participant.studentId,
        organization: att.participant.organization,
      },
      status: att.status,
      startedAt: att.startedAt.toISOString(),
      submittedAt: att.submittedAt?.toISOString() || null,
      timeSpentSeconds: att.timeSpentSeconds,
      totalMarks: att.totalMarks,
      earnedMarks: att.earnedMarks,
      scorePercentage: att.scorePercentage,
      isPassed: att.isPassed,
      tabSwitchCount: att.tabSwitchCount,
    }));
  }

  async getAttemptResult(attemptId: string) {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    const assessment = attempt.assessment;
    const answersMap: Record<string, any> = {};
    for (const ans of attempt.answers) {
      answersMap[ans.questionId] = {
        questionId: ans.questionId,
        selectedOptionIds: ans.selectedOptionIds,
        textAnswer: ans.textAnswer,
        isCorrect: ans.isCorrect,
        marksAwarded: ans.marksAwarded,
        isMarkedForReview: ans.isMarkedForReview,
        answeredAt: ans.answeredAt.toISOString(),
      };
    }

    let questions: any[] | undefined = undefined;
    if (assessment.allowAnswerReview) {
      questions = assessment.questions.map((q) => ({
        id: q.id,
        assessmentId: q.assessmentId,
        text: q.text,
        type: q.type,
        marks: q.marks,
        order: q.order,
        explanation: q.explanation,
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order,
        })),
        correctAnswers: q.options.filter((o) => o.isCorrect).map((o) => o.id),
      }));
    }

    const formattedAttempt = {
      id: attempt.id,
      assessmentId: attempt.assessmentId,
      assessmentTitle: assessment.title,
      participant: {
        id: attempt.participant.id,
        name: attempt.participant.name,
        email: attempt.participant.email,
        studentId: attempt.participant.studentId,
        organization: attempt.participant.organization,
      },
      status: attempt.status,
      answers: answersMap,
      startedAt: attempt.startedAt.toISOString(),
      submittedAt: attempt.submittedAt?.toISOString() || null,
      timeSpentSeconds: attempt.timeSpentSeconds,
      totalMarks: attempt.totalMarks,
      earnedMarks: attempt.earnedMarks,
      scorePercentage: attempt.scorePercentage,
      isPassed: attempt.isPassed,
      tabSwitchCount: attempt.tabSwitchCount,
    };

    const formattedAssessment = {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      category: assessment.category,
      instructions: assessment.instructions,
      accessCode: assessment.accessCode,
      creatorId: assessment.creatorId,
      status: assessment.status,
      settings: {
        shuffleQuestions: assessment.shuffleQuestions,
        shuffleOptions: assessment.shuffleOptions,
        showImmediateResults: assessment.showImmediateResults,
        allowAnswerReview: assessment.allowAnswerReview,
        maxAttempts: assessment.maxAttempts,
        timeLimitMinutes: assessment.timeLimitMinutes,
        passingScorePercentage: assessment.passingScorePercentage,
        requireParticipantEmail: assessment.requireParticipantEmail,
        requireParticipantId: assessment.requireParticipantId,
        enableAntiCheatWarnings: assessment.enableAntiCheatWarnings,
      },
      timeLimitMinutes: assessment.timeLimitMinutes,
      passingScorePercentage: assessment.passingScorePercentage,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
    };

    return {
      attempt: formattedAttempt,
      assessment: formattedAssessment,
      questions,
    };
  }

  async getAssessmentAnalytics(assessmentId: string, user?: { userId: string; role: string }) {
    const assessment = await this.assessmentRepo.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }

    if (user && user.role !== 'ADMIN' && assessment.creatorId !== user.userId) {
      throw new ForbiddenError('You do not have permission to view analytics for this assessment');
    }

    const attempts = await this.attemptRepo.findManyByAssessmentId(assessmentId);
    const completed = attempts.filter((a) => a.status === 'COMPLETED');

    const totalAttempts = attempts.length;
    const completedAttempts = completed.length;
    const passedAttempts = completed.filter((a) => a.isPassed).length;
    const failedAttempts = completedAttempts - passedAttempts;

    const scores = completed.map((a) => a.scorePercentage);
    const times = completed.map((a) => a.timeSpentSeconds);

    const averageScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
    const averageTimeSpentSeconds = times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 0;
    const passRatePercentage = completedAttempts > 0
      ? Math.round((passedAttempts / completedAttempts) * 1000) / 10
      : 0;

    // Score distribution bins: 0-20, 21-40, 41-60, 61-80, 81-100
    const distributionMap: Record<string, number> = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0,
    };

    for (const score of scores) {
      if (score <= 20) distributionMap['0-20%']++;
      else if (score <= 40) distributionMap['21-40%']++;
      else if (score <= 60) distributionMap['41-60%']++;
      else if (score <= 80) distributionMap['61-80%']++;
      else distributionMap['81-100%']++;
    }

    const scoreDistribution = Object.entries(distributionMap).map(([range, count]) => ({
      range,
      count,
    }));

    // Timeline grouping by Date (YYYY-MM-DD)
    const timelineMap: Record<string, { attempts: number; totalScore: number }> = {};
    for (const att of completed) {
      const dateKey = att.startedAt.toISOString().split('T')[0];
      if (!timelineMap[dateKey]) {
        timelineMap[dateKey] = { attempts: 0, totalScore: 0 };
      }
      timelineMap[dateKey].attempts++;
      timelineMap[dateKey].totalScore += att.scorePercentage;
    }

    const attemptsTimeline = Object.entries(timelineMap).map(([date, val]) => ({
      date,
      attempts: val.attempts,
      avgScore: Math.round((val.totalScore / val.attempts) * 10) / 10,
    }));

    // Question Performance Breakdown
    const questionPerformance = assessment.questions.map((q) => {
      let correctAnswersForQ = 0;
      let totalAnswersForQ = 0;

      for (const att of completed) {
        const userAns = att.answers.find((a) => a.questionId === q.id);
        if (userAns) {
          totalAnswersForQ++;
          if (userAns.isCorrect) {
            correctAnswersForQ++;
          }
        }
      }

      const successRate = totalAnswersForQ > 0
        ? Math.round((correctAnswersForQ / totalAnswersForQ) * 100)
        : 0;

      return {
        questionId: q.id,
        questionText: q.text,
        order: q.order,
        successRate,
        avgTimeSeconds: averageTimeSpentSeconds > 0 ? Math.round(averageTimeSpentSeconds / (assessment.questions.length || 1)) : 0,
      };
    });

    return {
      assessmentId,
      totalAttempts,
      completedAttempts,
      passedAttempts,
      failedAttempts,
      averageScore,
      highestScore,
      lowestScore,
      averageTimeSpentSeconds,
      passRatePercentage,
      scoreDistribution,
      attemptsTimeline,
      questionPerformance,
    };
  }
}
