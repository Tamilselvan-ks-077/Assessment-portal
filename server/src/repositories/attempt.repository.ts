import { prisma } from '../config/database';
import { AssessmentAttempt, AttemptAnswer, Prisma } from '@prisma/client';

export class AttemptRepository {
  async findById(id: string) {
    return prisma.assessmentAttempt.findUnique({
      where: { id },
      include: {
        assessment: {
          include: {
            questions: {
              include: { options: { orderBy: { order: 'asc' } } },
              orderBy: { order: 'asc' },
            },
          },
        },
        participant: true,
        answers: {
          include: {
            question: {
              include: { options: true },
            },
          },
        },
      },
    });
  }

  async findByAssessmentAndParticipant(assessmentId: string, participantId: string) {
    return prisma.assessmentAttempt.findMany({
      where: { assessmentId, participantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countAttempts(assessmentId: string, participantId: string): Promise<number> {
    return prisma.assessmentAttempt.count({
      where: { assessmentId, participantId },
    });
  }

  async findManyByAssessmentId(assessmentId: string) {
    return prisma.assessmentAttempt.findMany({
      where: { assessmentId },
      include: {
        participant: true,
        answers: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async create(data: Prisma.AssessmentAttemptCreateInput): Promise<AssessmentAttempt> {
    return prisma.assessmentAttempt.create({
      data,
      include: {
        participant: true,
      },
    });
  }

  async update(id: string, data: Prisma.AssessmentAttemptUpdateInput): Promise<AssessmentAttempt> {
    return prisma.assessmentAttempt.update({
      where: { id },
      data,
      include: {
        participant: true,
        answers: true,
      },
    });
  }

  async upsertAnswer(data: {
    attemptId: string;
    questionId: string;
    selectedOptionIds?: string[];
    textAnswer?: string | null;
    isMarkedForReview?: boolean;
    isCorrect?: boolean;
    marksAwarded?: number;
  }): Promise<AttemptAnswer> {
    const { attemptId, questionId, selectedOptionIds, textAnswer, isMarkedForReview, isCorrect, marksAwarded } = data;

    return prisma.attemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      create: {
        attemptId,
        questionId,
        selectedOptionIds: selectedOptionIds || [],
        textAnswer: textAnswer || null,
        isMarkedForReview: isMarkedForReview ?? false,
        isCorrect: isCorrect ?? false,
        marksAwarded: marksAwarded ?? 0,
        answeredAt: new Date(),
      },
      update: {
        selectedOptionIds: selectedOptionIds !== undefined ? selectedOptionIds : undefined,
        textAnswer: textAnswer !== undefined ? textAnswer : undefined,
        isMarkedForReview: isMarkedForReview !== undefined ? isMarkedForReview : undefined,
        isCorrect: isCorrect !== undefined ? isCorrect : undefined,
        marksAwarded: marksAwarded !== undefined ? marksAwarded : undefined,
        answeredAt: new Date(),
      },
    });
  }

  async incrementTabSwitch(attemptId: string): Promise<void> {
    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { tabSwitchCount: { increment: 1 } },
    });
  }
}
