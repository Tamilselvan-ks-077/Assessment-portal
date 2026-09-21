import { prisma } from '../config/database';
import { Assessment, Prisma } from '@prisma/client';

export class AssessmentRepository {
  async findById(id: string) {
    return prisma.assessment.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        questions: {
          include: { options: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { questions: true, attempts: true },
        },
      },
    });
  }

  async findByAccessCode(accessCode: string) {
    return prisma.assessment.findUnique({
      where: { accessCode },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        questions: {
          include: { options: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { questions: true, attempts: true },
        },
      },
    });
  }

  async findMany(params: {
    creatorId?: string;
    status?: Prisma.EnumAssessmentStatusFilter | any;
    category?: string;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const { creatorId, status, category, search, skip, take } = params;

    const where: Prisma.AssessmentWhereInput = {
      ...(creatorId ? { creatorId } : {}),
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { accessCode: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { questions: true, attempts: true },
          },
          questions: {
            select: { marks: true },
          },
        },
      }),
      prisma.assessment.count({ where }),
    ]);

    return { items, total };
  }

  async create(data: Prisma.AssessmentCreateInput): Promise<Assessment> {
    return prisma.assessment.create({
      data,
    });
  }

  async update(id: string, data: Prisma.AssessmentUpdateInput): Promise<Assessment> {
    return prisma.assessment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Assessment> {
    return prisma.assessment.delete({
      where: { id },
    });
  }
}
