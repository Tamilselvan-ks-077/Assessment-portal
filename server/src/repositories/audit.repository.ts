import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export class AuditRepository {
  async create(data: Prisma.AuditLogCreateInput) {
    return prisma.auditLog.create({
      data,
    });
  }

  async findMany(params: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    skip?: number;
    take?: number;
  }) {
    const { userId, entityType, entityId, skip, take } = params;
    const where: Prisma.AuditLogWhereInput = {
      ...(userId ? { userId } : {}),
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }
}
