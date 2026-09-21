import { ParticipantRepository } from '../repositories/participant.repository';
import { AssessmentRepository } from '../repositories/assessment.repository';
import { NotFoundError } from '../utils/errors';

export class ParticipantService {
  private participantRepo: ParticipantRepository;
  private assessmentRepo: AssessmentRepository;

  constructor() {
    this.participantRepo = new ParticipantRepository();
    this.assessmentRepo = new AssessmentRepository();
  }

  async getByAssessmentId(assessmentId: string) {
    const assessment = await this.assessmentRepo.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }

    const participants = await this.participantRepo.findByAssessmentId(assessmentId);

    return participants.map((p) => {
      const attempts = p.attempts;
      const totalAttempts = attempts.length;
      const passedAttempts = attempts.filter((a) => a.isPassed).length;
      const scores = attempts.filter((a) => a.status === 'COMPLETED').map((a) => a.scorePercentage);
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const lastAttempt = attempts[0];

      return {
        id: p.id,
        name: p.name,
        email: p.email,
        studentId: p.studentId || undefined,
        organization: p.organization || undefined,
        totalAttempts,
        passedAttempts,
        averageScore,
        lastAttemptDate: lastAttempt ? lastAttempt.startedAt.toISOString() : p.createdAt.toISOString(),
        assessmentsTaken: attempts.map((a) => ({
          assessmentId: a.assessmentId,
          assessmentTitle: assessment.title,
          score: a.scorePercentage,
          isPassed: a.isPassed,
          date: a.startedAt.toISOString(),
        })),
      };
    });
  }

  async registerParticipant(data: {
    email: string;
    name: string;
    studentId?: string;
    organization?: string;
  }) {
    return this.participantRepo.findOrCreate(data);
  }

  async getAllParticipants(params?: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 20));
    const skip = (page - 1) * limit;

    const { items, total } = await this.participantRepo.findAll({
      search: params?.search,
      skip,
      take: limit,
    });

    const formatted = items.map((p) => {
      const attempts = p.attempts;
      const totalAttempts = attempts.length;
      const passedAttempts = attempts.filter((a) => a.isPassed).length;
      const scores = attempts.filter((a) => a.status === 'COMPLETED').map((a) => a.scorePercentage);
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const lastAttempt = attempts[0];

      return {
        id: p.id,
        name: p.name,
        email: p.email,
        studentId: p.studentId || undefined,
        totalAttempts,
        passedAttempts,
        averageScore,
        lastAttemptDate: lastAttempt ? lastAttempt.startedAt.toISOString() : p.createdAt.toISOString(),
        assessmentsTaken: attempts.map((a) => ({
          assessmentId: a.assessmentId,
          assessmentTitle: a.assessment.title,
          score: a.scorePercentage,
          isPassed: a.isPassed,
          date: a.startedAt.toISOString(),
        })),
      };
    });

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
