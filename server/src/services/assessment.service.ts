import crypto from 'crypto';
import { AssessmentRepository } from '../repositories/assessment.repository';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { CreateAssessmentInput, UpdateAssessmentInput, AssessmentQueryInput } from '../validators/assessment.validator';

export class AssessmentService {
  private assessmentRepo: AssessmentRepository;

  constructor() {
    this.assessmentRepo = new AssessmentRepository();
  }

  private generateAccessCode(): string {
    return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars uppercase
  }

  private formatAssessment(assessment: any) {
    if (!assessment) return null;

    const questionsCount = assessment._count?.questions ?? assessment.questions?.length ?? 0;
    const totalMarks =
      assessment.questions?.reduce((acc: number, q: any) => acc + (q.marks || 0), 0) ?? 0;

    return {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      category: assessment.category,
      instructions: assessment.instructions,
      accessCode: assessment.accessCode,
      creatorId: assessment.creatorId,
      creatorName: assessment.creator?.name,
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
      maxAttempts: assessment.maxAttempts,
      startDate: assessment.startDate,
      endDate: assessment.endDate,
      questionsCount,
      totalMarks,
      questions: assessment.questions,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
    };
  }

  async getAll(query: AssessmentQueryInput, user: { userId: string; role: string }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    // ADMIN can see all, TEST_CREATOR sees their own
    const creatorId = user.role === 'ADMIN' ? undefined : user.userId;

    const { items, total } = await this.assessmentRepo.findMany({
      creatorId,
      status: query.status as any,
      category: query.category,
      search: query.search,
      skip,
      take: limit,
    });

    return {
      items: items.map(this.formatAssessment),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string, user?: { userId: string; role: string }) {
    const assessment = await this.assessmentRepo.findById(id);
    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }

    if (user && user.role !== 'ADMIN' && assessment.creatorId !== user.userId) {
      throw new ForbiddenError('You do not have permission to view this assessment');
    }

    return this.formatAssessment(assessment);
  }

  async getByAccessCode(accessCode: string) {
    const assessment = await this.assessmentRepo.findByAccessCode(accessCode.toUpperCase());
    if (!assessment) {
      throw new NotFoundError('Assessment with this access code was not found');
    }

    return this.formatAssessment(assessment);
  }

  async create(input: CreateAssessmentInput, userId: string) {
    let accessCode = input.accessCode?.toUpperCase() || this.generateAccessCode();

    // Check unique access code
    const existing = await this.assessmentRepo.findByAccessCode(accessCode);
    if (existing) {
      accessCode = this.generateAccessCode();
    }

    // Merge top-level settings or settings object if passed from frontend
    const s = input.settings || {};
    const shuffleQuestions = s.shuffleQuestions ?? input.shuffleQuestions ?? false;
    const shuffleOptions = s.shuffleOptions ?? input.shuffleOptions ?? false;
    const showImmediateResults = s.showImmediateResults ?? input.showImmediateResults ?? true;
    const allowAnswerReview = s.allowAnswerReview ?? input.allowAnswerReview ?? true;
    const maxAttempts = s.maxAttempts ?? input.maxAttempts ?? 1;
    const timeLimitMinutes = s.timeLimitMinutes ?? input.timeLimitMinutes ?? 0;
    const passingScorePercentage = s.passingScorePercentage ?? input.passingScorePercentage ?? 70;
    const requireParticipantEmail = s.requireParticipantEmail ?? input.requireParticipantEmail ?? true;
    const requireParticipantId = s.requireParticipantId ?? input.requireParticipantId ?? false;
    const enableAntiCheatWarnings = s.enableAntiCheatWarnings ?? input.enableAntiCheatWarnings ?? true;

    const created = await this.assessmentRepo.create({
      title: input.title,
      description: input.description ?? '',
      category: input.category ?? 'General',
      instructions: input.instructions,
      accessCode,
      status: 'DRAFT',
      timeLimitMinutes,
      passingScorePercentage,
      maxAttempts,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      shuffleQuestions,
      shuffleOptions,
      showImmediateResults,
      allowAnswerReview,
      requireParticipantEmail,
      requireParticipantId,
      enableAntiCheatWarnings,
      creator: { connect: { id: userId } },
    });

    return this.getById(created.id);
  }

  async update(id: string, input: UpdateAssessmentInput, user: { userId: string; role: string }) {
    const existing = await this.assessmentRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Assessment not found');
    }

    if (user.role !== 'ADMIN' && existing.creatorId !== user.userId) {
      throw new ForbiddenError('You do not have permission to update this assessment');
    }

    const s = input.settings || {};

    const updated = await this.assessmentRepo.update(id, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.instructions !== undefined ? { instructions: input.instructions } : {}),
      ...(input.status !== undefined ? { status: input.status as any } : {}),
      ...(input.accessCode !== undefined ? { accessCode: input.accessCode.toUpperCase() } : {}),
      ...(s.timeLimitMinutes !== undefined || input.timeLimitMinutes !== undefined
        ? { timeLimitMinutes: s.timeLimitMinutes ?? input.timeLimitMinutes }
        : {}),
      ...(s.passingScorePercentage !== undefined || input.passingScorePercentage !== undefined
        ? { passingScorePercentage: s.passingScorePercentage ?? input.passingScorePercentage }
        : {}),
      ...(s.maxAttempts !== undefined || input.maxAttempts !== undefined
        ? { maxAttempts: s.maxAttempts ?? input.maxAttempts }
        : {}),
      ...(input.startDate !== undefined
        ? { startDate: input.startDate ? new Date(input.startDate) : null }
        : {}),
      ...(input.endDate !== undefined
        ? { endDate: input.endDate ? new Date(input.endDate) : null }
        : {}),
      ...(s.shuffleQuestions !== undefined || input.shuffleQuestions !== undefined
        ? { shuffleQuestions: s.shuffleQuestions ?? input.shuffleQuestions }
        : {}),
      ...(s.shuffleOptions !== undefined || input.shuffleOptions !== undefined
        ? { shuffleOptions: s.shuffleOptions ?? input.shuffleOptions }
        : {}),
      ...(s.showImmediateResults !== undefined || input.showImmediateResults !== undefined
        ? { showImmediateResults: s.showImmediateResults ?? input.showImmediateResults }
        : {}),
      ...(s.allowAnswerReview !== undefined || input.allowAnswerReview !== undefined
        ? { allowAnswerReview: s.allowAnswerReview ?? input.allowAnswerReview }
        : {}),
      ...(s.requireParticipantEmail !== undefined || input.requireParticipantEmail !== undefined
        ? { requireParticipantEmail: s.requireParticipantEmail ?? input.requireParticipantEmail }
        : {}),
      ...(s.requireParticipantId !== undefined || input.requireParticipantId !== undefined
        ? { requireParticipantId: s.requireParticipantId ?? input.requireParticipantId }
        : {}),
      ...(s.enableAntiCheatWarnings !== undefined || input.enableAntiCheatWarnings !== undefined
        ? { enableAntiCheatWarnings: s.enableAntiCheatWarnings ?? input.enableAntiCheatWarnings }
        : {}),
    });

    return this.getById(updated.id);
  }

  async publish(id: string, user: { userId: string; role: string }) {
    const existing = await this.assessmentRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Assessment not found');
    }

    if (user.role !== 'ADMIN' && existing.creatorId !== user.userId) {
      throw new ForbiddenError('You do not have permission to publish this assessment');
    }

    if (existing.questions.length === 0) {
      throw new BadRequestError('Cannot publish an assessment with zero questions');
    }

    const updated = await this.assessmentRepo.update(id, { status: 'ACTIVE' });
    return this.getById(updated.id);
  }

  async close(id: string, user: { userId: string; role: string }) {
    const existing = await this.assessmentRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Assessment not found');
    }

    if (user.role !== 'ADMIN' && existing.creatorId !== user.userId) {
      throw new ForbiddenError('You do not have permission to close this assessment');
    }

    const updated = await this.assessmentRepo.update(id, { status: 'ARCHIVED' });
    return this.getById(updated.id);
  }

  async delete(id: string, user: { userId: string; role: string }) {
    const existing = await this.assessmentRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Assessment not found');
    }

    if (user.role !== 'ADMIN' && existing.creatorId !== user.userId) {
      throw new ForbiddenError('You do not have permission to delete this assessment');
    }

    await this.assessmentRepo.delete(id);
    return { id, message: 'Assessment deleted successfully' };
  }
}
