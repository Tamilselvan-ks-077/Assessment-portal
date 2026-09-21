import { AttemptRepository } from '../repositories/attempt.repository';
import { AssessmentRepository } from '../repositories/assessment.repository';
import { ParticipantRepository } from '../repositories/participant.repository';
import { GradingService } from './grading.service';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { StartAttemptInput, SaveAnswerInput, SubmitAttemptInput } from '../validators/attempt.validator';

export class AttemptService {
  private attemptRepo: AttemptRepository;
  private assessmentRepo: AssessmentRepository;
  private participantRepo: ParticipantRepository;
  private gradingService: GradingService;

  constructor() {
    this.attemptRepo = new AttemptRepository();
    this.assessmentRepo = new AssessmentRepository();
    this.participantRepo = new ParticipantRepository();
    this.gradingService = new GradingService();
  }

  async getPublicTestInfo(accessCode: string) {
    const assessment = await this.assessmentRepo.findByAccessCode(accessCode.toUpperCase());
    if (!assessment) {
      throw new NotFoundError('Assessment not found. Please check your access code.');
    }

    if (assessment.status !== 'ACTIVE') {
      throw new BadRequestError('This assessment is not currently active.');
    }

    const now = new Date();
    if (assessment.startDate && now < assessment.startDate) {
      throw new BadRequestError(`This assessment will be available starting ${assessment.startDate.toISOString()}`);
    }
    if (assessment.endDate && now > assessment.endDate) {
      throw new BadRequestError('This assessment has ended.');
    }

    const totalMarks = assessment.questions.reduce((sum, q) => sum + (q.marks || 0), 0);

    return {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      category: assessment.category,
      instructions: assessment.instructions,
      accessCode: assessment.accessCode,
      timeLimitMinutes: assessment.timeLimitMinutes,
      passingScorePercentage: assessment.passingScorePercentage,
      maxAttempts: assessment.maxAttempts,
      questionsCount: assessment.questions.length,
      totalMarks,
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
    };
  }

  async startAttempt(input: StartAttemptInput, meta?: { ipAddress?: string; userAgent?: string }) {
    if (!input.accessCode) {
      throw new BadRequestError('Access code is required');
    }

    const assessment = await this.assessmentRepo.findByAccessCode(input.accessCode.toUpperCase());
    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }

    if (assessment.status !== 'ACTIVE') {
      throw new BadRequestError('This assessment is not currently open for responses');
    }

    const now = new Date();
    if (assessment.startDate && now < assessment.startDate) {
      throw new BadRequestError('This assessment is not open yet');
    }
    if (assessment.endDate && now > assessment.endDate) {
      throw new BadRequestError('This assessment has closed');
    }

    // Find or create participant
    const participant = await this.participantRepo.findOrCreate({
      email: input.participant.email,
      name: input.participant.name,
      studentId: input.participant.studentId,
      organization: input.participant.organization,
    });

    // Enforce Max Attempts Limit
    const existingAttemptsCount = await this.attemptRepo.countAttempts(assessment.id, participant.id);
    if (assessment.maxAttempts > 0 && existingAttemptsCount >= assessment.maxAttempts) {
      throw new ForbiddenError(
        `Maximum attempt limit reached (${assessment.maxAttempts} attempt(s) allowed). You cannot retake this test.`
      );
    }

    const startedAt = new Date();
    let expiresAt: Date | null = null;
    if (assessment.timeLimitMinutes > 0) {
      expiresAt = new Date(startedAt.getTime() + assessment.timeLimitMinutes * 60 * 1000 + 30 * 1000); // 30s grace buffer
    }

    const totalMarks = assessment.questions.reduce((sum, q) => sum + (q.marks || 0), 0);

    const attempt = await this.attemptRepo.create({
      assessment: { connect: { id: assessment.id } },
      participant: { connect: { id: participant.id } },
      status: 'IN_PROGRESS',
      startedAt,
      expiresAt,
      totalMarks,
      earnedMarks: 0,
      scorePercentage: 0,
      isPassed: false,
      tabSwitchCount: 0,
      ipAddress: meta?.ipAddress || null,
      userAgent: meta?.userAgent || null,
    });

    // Sanitize questions for candidate: NEVER expose isCorrect or explanation
    let candidateQuestions = assessment.questions.map((q) => ({
      id: q.id,
      assessmentId: q.assessmentId,
      text: q.text,
      type: q.type,
      marks: q.marks,
      order: q.order,
      isRequired: q.isRequired,
      options: q.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        order: opt.order,
      })),
    }));

    // Shuffle questions if configured
    if (assessment.shuffleQuestions) {
      candidateQuestions = [...candidateQuestions].sort(() => Math.random() - 0.5);
    }

    // Shuffle options if configured
    if (assessment.shuffleOptions) {
      candidateQuestions = candidateQuestions.map((q) => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5),
      }));
    }

    return {
      attempt: {
        id: attempt.id,
        assessmentId: assessment.id,
        assessmentTitle: assessment.title,
        participant: {
          id: participant.id,
          name: participant.name,
          email: participant.email,
          studentId: participant.studentId,
          organization: participant.organization,
        },
        status: attempt.status,
        answers: {},
        startedAt: attempt.startedAt.toISOString(),
        expiresAt: attempt.expiresAt?.toISOString() || null,
        timeSpentSeconds: 0,
        totalMarks: attempt.totalMarks,
        earnedMarks: 0,
        scorePercentage: 0,
        isPassed: false,
        tabSwitchCount: 0,
      },
      questions: candidateQuestions,
    };
  }

  async getAttempt(attemptId: string) {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    const answersMap: Record<string, any> = {};
    for (const ans of attempt.answers) {
      answersMap[ans.questionId] = {
        questionId: ans.questionId,
        selectedOptionIds: ans.selectedOptionIds,
        textAnswer: ans.textAnswer,
        isMarkedForReview: ans.isMarkedForReview,
        isCorrect: attempt.status === 'COMPLETED' ? ans.isCorrect : undefined,
        marksAwarded: attempt.status === 'COMPLETED' ? ans.marksAwarded : undefined,
        answeredAt: ans.answeredAt.toISOString(),
      };
    }

    return {
      id: attempt.id,
      assessmentId: attempt.assessmentId,
      assessmentTitle: attempt.assessment.title,
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
      submittedAt: attempt.submittedAt?.toISOString() || undefined,
      expiresAt: attempt.expiresAt?.toISOString() || undefined,
      timeSpentSeconds: attempt.timeSpentSeconds,
      totalMarks: attempt.totalMarks,
      earnedMarks: attempt.earnedMarks,
      scorePercentage: attempt.scorePercentage,
      isPassed: attempt.isPassed,
      tabSwitchCount: attempt.tabSwitchCount,
    };
  }

  async saveAnswer(attemptId: string, input: SaveAnswerInput) {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      throw new BadRequestError(`Cannot save answers for attempt with status: ${attempt.status}`);
    }

    // Check expiration timer (with 30-second network latency grace period)
    if (attempt.expiresAt) {
      const now = new Date();
      if (now.getTime() > attempt.expiresAt.getTime() + 30000) {
        await this.attemptRepo.update(attemptId, { status: 'EXPIRED' });
        throw new BadRequestError('Time limit exceeded. Your test session has expired.');
      }
    }

    await this.attemptRepo.upsertAnswer({
      attemptId,
      questionId: input.questionId,
      selectedOptionIds: input.selectedOptionIds,
      textAnswer: input.textAnswer,
      isMarkedForReview: input.isMarkedForReview,
    });

    return this.getAttempt(attemptId);
  }

  async recordTabSwitch(attemptId: string) {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    if (attempt.status === 'IN_PROGRESS') {
      await this.attemptRepo.incrementTabSwitch(attemptId);
    }

    return { success: true, tabSwitchCount: attempt.tabSwitchCount + 1 };
  }

  async submitAttempt(attemptId: string, input: SubmitAttemptInput) {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    if (attempt.status === 'COMPLETED') {
      return this.getAttempt(attemptId);
    }

    const submittedAt = new Date();
    const serverDurationSeconds = Math.max(
      0,
      Math.floor((submittedAt.getTime() - attempt.startedAt.getTime()) / 1000)
    );
    const timeSpentSeconds = input.timeSpentSeconds || serverDurationSeconds;

    // Check if test was expired by excessive time (> limit + grace)
    let finalStatus: 'COMPLETED' | 'EXPIRED' = 'COMPLETED';
    if (attempt.expiresAt && submittedAt.getTime() > attempt.expiresAt.getTime() + 60000) {
      finalStatus = 'EXPIRED';
    }

    // Grade candidate answers securely against DB correct options
    const questionsForGrading = attempt.assessment.questions.map((q) => ({
      id: q.id,
      type: q.type as any,
      marks: q.marks,
      options: q.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
      explanation: q.explanation,
    }));

    const answersInputMap: Record<string, any> = {};
    for (const ans of attempt.answers) {
      answersInputMap[ans.questionId] = {
        questionId: ans.questionId,
        selectedOptionIds: ans.selectedOptionIds,
        textAnswer: ans.textAnswer,
        isMarkedForReview: ans.isMarkedForReview,
      };
    }

    const gradingSummary = this.gradingService.gradeAssessment(
      questionsForGrading,
      answersInputMap,
      attempt.assessment.passingScorePercentage
    );

    // Save graded answers back to DB
    for (const [questionId, graded] of Object.entries(gradingSummary.gradedAnswers)) {
      await this.attemptRepo.upsertAnswer({
        attemptId,
        questionId,
        selectedOptionIds: graded.selectedOptionIds,
        textAnswer: graded.textAnswer,
        isMarkedForReview: graded.isMarkedForReview,
        isCorrect: graded.isCorrect,
        marksAwarded: graded.marksAwarded,
      });
    }

    // Finalize attempt
    await this.attemptRepo.update(attemptId, {
      status: finalStatus,
      submittedAt,
      timeSpentSeconds,
      totalMarks: gradingSummary.totalMarks,
      earnedMarks: gradingSummary.earnedMarks,
      scorePercentage: gradingSummary.scorePercentage,
      isPassed: gradingSummary.isPassed,
    });

    return this.getAttempt(attemptId);
  }
}
