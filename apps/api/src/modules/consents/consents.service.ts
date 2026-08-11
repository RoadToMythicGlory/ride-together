import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestUser } from '../../common/request-context';

export type ConsentItem = {
  consentType: string;
  version: string;
  accepted: boolean;
  applicationId?: string;
};

@Injectable()
export class ConsentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(user: RequestUser) {
    return this.prisma.consent.findMany({
      where: { actorUserId: user.userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveMany(user: RequestUser, items: ConsentItem[]) {
    if (!items?.length) throw new BadRequestException('No consents provided');
    const created = [];
    for (const item of items) {
      const row = await this.prisma.consent.create({
        data: {
          actorUserId: user.userId,
          consentType: item.consentType,
          version: item.version,
          accepted: item.accepted,
          applicationId: item.applicationId,
        },
      });
      created.push(row);
    }
    return created;
  }
}
