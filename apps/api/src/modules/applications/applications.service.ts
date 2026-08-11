import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CONSENT_TYPES, LEGAL_VERSIONS } from '@ride-together/shared';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestUser } from '../../common/request-context';
import {
  AssignApplicationDto,
  CreateApplicationDto,
  TransitionApplicationDto,
} from './dto/applications.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private requireTenant(user: RequestUser) {
    if (!user.activeTenantId) throw new BadRequestException('No active tenant');
    return user.activeTenantId;
  }

  async create(user: RequestUser, dto: CreateApplicationDto): Promise<unknown> {
    if (!dto.acceptParticipation || !dto.acceptPrivacy) {
      throw new BadRequestException('Participation and privacy consents are required');
    }
    const tenantId = this.requireTenant(user);

    const created = await this.prisma.$transaction(async (tx) => {
      const child = await tx.child.create({
        data: {
          tenantId,
          nickname: dto.nickname,
          ageYears: dto.ageYears,
          regionId: dto.regionId,
          cityId: dto.cityId,
        },
      });

      await tx.childPrivateData.create({
        data: {
          childId: child.id,
          privateStory: dto.privateStory,
        },
      });

      await tx.childGuardian.create({
        data: {
          childId: child.id,
          userId: user.userId,
          relationship: 'PARENT',
          isPrimary: true,
        },
      });

      const application = await tx.childApplication.create({
        data: {
          tenantId,
          childId: child.id,
          submitterUserId: user.userId,
          status: 'SUBMITTED',
          reasonSummary: dto.reasonSummary,
          contactPhone: dto.contactPhone,
          likesMotorcycles: dto.likesMotorcycles,
          noiseSensitivity: dto.noiseSensitivity,
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          actorUserId: user.userId,
          fromStatus: null,
          toStatus: 'SUBMITTED',
        },
      });

      const consents = [
        {
          applicationId: application.id,
          actorUserId: user.userId,
          consentType: CONSENT_TYPES.PARTICIPATION,
          version: LEGAL_VERSIONS.participation,
          accepted: true,
        },
        {
          applicationId: application.id,
          actorUserId: user.userId,
          consentType: CONSENT_TYPES.PRIVACY_POLICY,
          version: LEGAL_VERSIONS.privacy,
          accepted: true,
        },
        {
          applicationId: application.id,
          actorUserId: user.userId,
          consentType: CONSENT_TYPES.ANONYMOUS_STORY,
          version: LEGAL_VERSIONS.anonymousStory,
          accepted: Boolean(dto.shareStory),
        },
      ];
      await tx.consent.createMany({ data: consents });

      return application;
    });

    await this.audit.log({
      actorUserId: user.userId,
      tenantId,
      action: 'application.submitted',
      entityType: 'ChildApplication',
      entityId: created.id,
    });

    return this.getOne(user, created.id);
  }

  async listMine(user: RequestUser) {
    const tenantId = this.requireTenant(user);
    return this.prisma.childApplication.findMany({
      where: { tenantId, submitterUserId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        child: { select: { id: true, nickname: true, ageYears: true } },
      },
    });
  }

  async listQueue(user: RequestUser) {
    const tenantId = this.requireTenant(user);
    return this.prisma.childApplication.findMany({
      where: {
        tenantId,
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED', 'APPROVED', 'WAITLISTED'] },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        child: { select: { id: true, nickname: true, ageYears: true, regionId: true } },
        submitter: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async getOne(user: RequestUser, id: string): Promise<unknown> {
    const tenantId = this.requireTenant(user);
    const app = await this.prisma.childApplication.findFirst({
      where: { id, tenantId },
      include: {
        child: {
          include: {
            privateData: true,
            region: true,
            city: true,
          },
        },
        history: { orderBy: { createdAt: 'desc' }, take: 20 },
        consents: true,
        assignments: {
          include: {
            event: true,
            participation: true,
          },
        },
      },
    });
    if (!app) throw new NotFoundException('Application not found');

    const isOwner = app.submitterUserId === user.userId;
    const canReview =
      user.platformRoles.includes('SUPER_ADMIN') ||
      user.tenantRoles.includes('ADMIN') ||
      user.tenantRoles.includes('EVENT_MANAGER');

    if (!isOwner && !canReview) throw new ForbiddenException();

    if (!canReview && app.child.privateData) {
      // parents may see their own private data
    } else if (!canReview) {
      // noop
    }

    return app;
  }

  async transition(user: RequestUser, id: string, dto: TransitionApplicationDto) {
    const tenantId = this.requireTenant(user);
    const app = await this.prisma.childApplication.findFirst({ where: { id, tenantId } });
    if (!app) throw new NotFoundException('Application not found');

    if (dto.status === 'WITHDRAWN' && app.submitterUserId !== user.userId) {
      throw new ForbiddenException();
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.childApplication.update({
        where: { id },
        data: { status: dto.status as never },
      });
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          actorUserId: user.userId,
          fromStatus: app.status,
          toStatus: dto.status as never,
          reason: dto.reason,
        },
      });
      return row;
    });

    await this.audit.log({
      actorUserId: user.userId,
      tenantId,
      action: 'application.status_changed',
      entityType: 'ChildApplication',
      entityId: id,
      metadata: { from: app.status, to: dto.status },
    });

    return updated;
  }

  async assign(user: RequestUser, id: string, dto: AssignApplicationDto) {
    const tenantId = this.requireTenant(user);
    const app = await this.prisma.childApplication.findFirst({
      where: { id, tenantId },
    });
    if (!app) throw new NotFoundException('Application not found');
    if (!['APPROVED', 'WAITLISTED', 'VERIFIED'].includes(app.status)) {
      throw new BadRequestException('Application must be approved before assignment');
    }

    const event = await this.prisma.event.findFirst({
      where: { id: dto.eventId, tenantId },
    });
    if (!event) throw new NotFoundException('Event not found');

    const result = await this.prisma.$transaction(async (tx) => {
      const assignment = await tx.eventChildAssignment.create({
        data: {
          eventId: event.id,
          childId: app.childId,
          applicationId: app.id,
          assignedById: user.userId,
          notes: dto.notes,
        },
      });
      await tx.eventChildParticipation.create({
        data: {
          assignmentId: assignment.id,
          status: 'INVITED',
          invitedAt: new Date(),
        },
      });
      await tx.childApplication.update({
        where: { id: app.id },
        data: { status: 'ASSIGNED_TO_EVENT' },
      });
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: app.id,
          actorUserId: user.userId,
          fromStatus: app.status,
          toStatus: 'ASSIGNED_TO_EVENT',
        },
      });
      return assignment;
    });

    await this.audit.log({
      actorUserId: user.userId,
      tenantId,
      action: 'application.assigned',
      entityType: 'ChildApplication',
      entityId: id,
      metadata: { eventId: event.id },
    });

    return result;
  }
}
