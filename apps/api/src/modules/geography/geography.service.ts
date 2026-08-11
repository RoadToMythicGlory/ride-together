import {
  BadRequestException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ReplaceNotificationRegionsDto } from './dto/notification-regions.dto';

@Injectable()
export class GeographyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  listRegions() {
    return this.prisma.geographicRegion.findMany({
      where: { isActive: true, country: 'IL' },
      orderBy: { sortOrder: 'asc' },
      include: {
        cities: {
          where: { isActive: true },
          orderBy: { nameHe: 'asc' },
        },
      },
    });
  }

  async replaceNotificationRegions(
    userId: string,
    tenantId: string | null,
    dto: ReplaceNotificationRegionsDto,
  ) {
    if (!tenantId) throw new ForbiddenException('Active tenant required');

    for (const item of dto.items) {
      const hasCity = Boolean(item.cityId);
      const hasRegion = Boolean(item.regionId);
      if (hasCity === hasRegion) {
        throw new BadRequestException(
          'Each subscription must include exactly one of cityId or regionId',
        );
      }
    }

    const cityIds = dto.items.map((i) => i.cityId).filter(Boolean) as string[];
    const regionIds = dto.items
      .map((i) => i.regionId)
      .filter(Boolean) as string[];

    if (cityIds.length) {
      const cities = await this.prisma.city.count({
        where: { id: { in: cityIds }, isActive: true },
      });
      if (cities !== cityIds.length) {
        throw new BadRequestException('Invalid cityId in subscriptions');
      }
    }
    if (regionIds.length) {
      const regions = await this.prisma.geographicRegion.count({
        where: { id: { in: regionIds }, isActive: true },
      });
      if (regions !== regionIds.length) {
        throw new BadRequestException('Invalid regionId in subscriptions');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userNotificationRegion.deleteMany({
        where: { userId, tenantId },
      });
      if (dto.items.length) {
        await tx.userNotificationRegion.createMany({
          data: dto.items.map((item) => ({
            userId,
            tenantId,
            cityId: item.cityId ?? null,
            regionId: item.regionId ?? null,
          })),
        });
      }
    });

    await this.audit.log({
      actorUserId: userId,
      tenantId,
      action: 'notification_regions.updated',
      entityType: 'UserNotificationRegion',
      entityId: userId,
      metadata: { count: dto.items.length },
    });

    return this.prisma.userNotificationRegion.findMany({
      where: { userId, tenantId },
      include: { city: true, region: true },
    });
  }
}
