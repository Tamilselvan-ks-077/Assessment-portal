import { prisma } from '../config/database';
import { Question, QuestionOption } from '@prisma/client';

export class QuestionRepository {
  async findById(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        options: { orderBy: { order: 'asc' } },
        assessment: { select: { id: true, creatorId: true, status: true } },
      },
    });
  }

  async findByAssessmentId(assessmentId: string) {
    return prisma.question.findMany({
      where: { assessmentId },
      include: {
        options: { orderBy: { order: 'asc' } },
      },
      orderBy: { order: 'asc' },
    });
  }

  async create(data: {
    assessmentId: string;
    text: string;
    type: any;
    marks: number;
    order: number;
    explanation?: string | null;
    isRequired?: boolean;
    options?: { text: string; isCorrect: boolean; order: number }[];
  }) {
    const { options, ...questionData } = data;

    return prisma.question.create({
      data: {
        ...questionData,
        options: options && options.length > 0
          ? {
              create: options.map((opt, idx) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
                order: opt.order ?? idx,
              })),
            }
          : undefined,
      },
      include: {
        options: { orderBy: { order: 'asc' } },
      },
    });
  }

  async update(
    id: string,
    data: {
      text?: string;
      type?: any;
      marks?: number;
      order?: number;
      explanation?: string | null;
      isRequired?: boolean;
      options?: { id?: string; text: string; isCorrect: boolean; order?: number }[];
    }
  ) {
    const { options, ...questionData } = data;

    return prisma.$transaction(async (tx) => {
      if (options) {
        // Remove existing options and recreate for consistency
        await tx.questionOption.deleteMany({ where: { questionId: id } });
        await tx.questionOption.createMany({
          data: options.map((opt, idx) => ({
            questionId: id,
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: opt.order ?? idx,
          })),
        });
      }

      return tx.question.update({
        where: { id },
        data: questionData,
        include: {
          options: { orderBy: { order: 'asc' } },
        },
      });
    });
  }

  async delete(id: string): Promise<Question> {
    return prisma.question.delete({
      where: { id },
    });
  }

  async reorder(assessmentId: string, orderedItems: { id: string; order: number }[]) {
    return prisma.$transaction(
      orderedItems.map((item) =>
        prisma.question.update({
          where: { id: item.id, assessmentId },
          data: { order: item.order },
        })
      )
    );
  }
}
