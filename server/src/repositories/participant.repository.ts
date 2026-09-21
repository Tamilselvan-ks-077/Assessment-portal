import { prisma } from '../config/database';
import { Participant, Prisma } from '@prisma/client';

export class ParticipantRepository {
  async findById(id: string): Promise<Participant | null> {
    return prisma.participant.findUnique({
      where: { id },
      include: {
        attempts: {
          include: {
            assessment: { select: { id: true, title: true } },
          },
        },
      },
    });
  }

  async findByEmailAndStudentId(email: string, studentId?: string | null): Promise<Participant | null> {
    const participants = await prisma.participant.findMany({
      where: {
        email: email.toLowerCase(),
        ...(studentId ? { studentId } : {}),
      },
      take: 1,
    });
    return participants[0] || null;
  }

  async findOrCreate(data: {
    email: string;
    name: string;
    studentId?: string | null;
    organization?: string | null;
  }): Promise<Participant> {
    const existing = await this.findByEmailAndStudentId(data.email, data.studentId);
    if (existing) {
      return prisma.participant.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          organization: data.organization || existing.organization,
        },
      });
    }

    return prisma.participant.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        studentId: data.studentId || null,
        organization: data.organization || null,
      },
    });
  }

  async findByAssessmentId(assessmentId: string) {
    return prisma.participant.findMany({
      where: {
        attempts: {
          some: { assessmentId },
        },
      },
      include: {
        attempts: {
          where: { assessmentId },
          orderBy: { startedAt: 'desc' },
        },
      },
    });
  }

  async findAll(params?: { search?: string; skip?: number; take?: number }) {
    const { search, skip, take } = params || {};
    const where: Prisma.ParticipantWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { studentId: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.participant.findMany({
        where,
        skip,
        take,
        include: {
          attempts: {
            include: {
              assessment: { select: { id: true, title: true } },
            },
            orderBy: { startedAt: 'desc' },
          },
        },
      }),
      prisma.participant.count({ where }),
    ]);

    return { items, total };
  }
}
