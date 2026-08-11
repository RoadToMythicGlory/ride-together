import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestUser } from '../../common/request-context';
import {
  CreateEventDto,
  ParticipationRespondDto,
  PublishEventDto,
  RsvpDto,
} from './dto/events.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private requireTenant(user: RequestUser) {
    if (!user.activeTenantId) throw new BadRequestException('No active tenant');
    return user.activeTenantId;
  }

  private publicShape(
    event: {
      id: string;
      title: string;
      description: string | null;
      aboutText: string | null;
      audienceText: string | null;
      flowSteps: unknown;
      status: string;
      startsAt: Date;
      regionId: string;
      cityId: string | null;
      publicMeetingArea: string | null;
      exactLocation: string | null;
      locationVisibilityPolicy: string;
      riderTarget: number | null;
      childCapacity: number | null;
      region?: { id: string; key: string; nameHe: string } | null;
      city?: { id: string; key: string; nameHe: string } | null;
      _count?: { rsvps: number; assignments: number };
    },
    opts: { revealExact: boolean },
  ) {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      aboutText: event.aboutText,
      audienceText: event.audienceText,
      flowSteps: Array.isArray(event.flowSteps) ? event.flowSteps : [],
      status: event.status,
      startsAt: event.startsAt,
      region: event.region ?? null,
      city: event.city ?? null,
      publicMeetingArea: event.publicMeetingArea,
      exactLocation: opts.revealExact ? event.exactLocation : null,
      locationVisibilityPolicy: event.locationVisibilityPolicy,
      riderTarget: event.riderTarget,
      childCapacity: event.childCapacity,
      ridersCount: event._count?.rsvps ?? 0,
      childrenCount: event._count?.assignments ?? 0,
    };
  }

  async create(user: RequestUser, dto: CreateEventDto): Promise<unknown> {
    const tenantId = this.requireTenant(user);
    const event = await this.prisma.event.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description,
        aboutText: dto.aboutText,
        audienceText: dto.audienceText,
        flowSteps: dto.flowSteps ?? [],
        startsAt: new Date(dto.startsAt),
        regionId: dto.regionId,
        cityId: dto.cityId,
        publicMeetingArea: dto.publicMeetingArea,
        exactLocation: dto.exactLocation,
        riderTarget: dto.riderTarget ?? 60,
        childCapacity: dto.childCapacity ?? 12,
        status: 'DRAFT',
      },
    });
    await this.audit.log({
      actorUserId: user.userId,
      tenantId,
      action: 'event.created',
      entityType: 'Event',
      entityId: event.id,
    });
    return event;
  }

  async listPublic(user: RequestUser) {
    const tenantId = this.requireTenant(user);
    const events = await this.prisma.event.findMany({
      where: {
        tenantId,
        status: { in: ['OPEN_FOR_RIDERS', 'FULL', 'CONFIRMED', 'PLANNING'] },
      },
      orderBy: { startsAt: 'asc' },
      include: {
        region: true,
        city: true,
        _count: {
          select: {
            rsvps: { where: { status: { in: ['CONFIRMED', 'INTERESTED', 'CHECKED_IN'] } } },
            assignments: true,
          },
        },
      },
    });
    return events.map((e) => this.publicShape(e, { revealExact: false }));
  }

  async getOne(user: RequestUser, id: string) {
    const tenantId = this.requireTenant(user);
    const event = await this.prisma.event.findFirst({
      where: { id, tenantId },
      include: {
        region: true,
        city: true,
        _count: {
          select: {
            rsvps: { where: { status: { in: ['CONFIRMED', 'INTERESTED', 'CHECKED_IN'] } } },
            assignments: true,
          },
        },
        rsvps: {
          where: { userId: user.userId },
          take: 1,
        },
      },
    });
    if (!event) throw new NotFoundException('Event not found');

    const myRsvp = event.rsvps[0] ?? null;
    const revealExact =
      event.locationVisibilityPolicy === 'PUBLIC' ||
      (event.locationVisibilityPolicy === 'AFTER_RSVP' &&
        myRsvp?.status === 'CONFIRMED');

    return {
      ...this.publicShape(event, { revealExact }),
      myRsvp: myRsvp
        ? { id: myRsvp.id, status: myRsvp.status, motorcycleInfo: myRsvp.motorcycleInfo }
        : null,
    };
  }

  async setStatus(user: RequestUser, id: string, dto: PublishEventDto): Promise<unknown> {
    const tenantId = this.requireTenant(user);
    const event = await this.prisma.event.findFirst({ where: { id, tenantId } });
    if (!event) throw new NotFoundException('Event not found');
    const updated = await this.prisma.event.update({
      where: { id },
      data: { status: dto.status as never },
    });
    await this.audit.log({
      actorUserId: user.userId,
      tenantId,
      action: 'event.status_changed',
      entityType: 'Event',
      entityId: id,
      metadata: { status: dto.status },
    });
    return updated;
  }

  async rsvp(user: RequestUser, id: string, dto: RsvpDto) {
    const tenantId = this.requireTenant(user);
    const event = await this.prisma.event.findFirst({ where: { id, tenantId } });
    if (!event) throw new NotFoundException('Event not found');
    if (!['OPEN_FOR_RIDERS', 'FULL', 'CONFIRMED'].includes(event.status)) {
      throw new BadRequestException('Event is not open for RSVP');
    }

    const row = await this.prisma.eventRiderRSVP.upsert({
      where: { eventId_userId: { eventId: id, userId: user.userId } },
      create: {
        eventId: id,
        userId: user.userId,
        status: dto.status as never,
        motorcycleInfo: dto.motorcycleInfo,
        hasPassenger: dto.hasPassenger ?? false,
      },
      update: {
        status: dto.status as never,
        motorcycleInfo: dto.motorcycleInfo,
        hasPassenger: dto.hasPassenger ?? false,
      },
    });

    await this.audit.log({
      actorUserId: user.userId,
      tenantId,
      action: 'event.rsvp',
      entityType: 'Event',
      entityId: id,
      metadata: { status: dto.status },
    });

    return row;
  }

  async myRsvps(user: RequestUser): Promise<unknown> {
    const tenantId = this.requireTenant(user);
    return this.prisma.eventRiderRSVP.findMany({
      where: {
        userId: user.userId,
        event: { tenantId },
        status: { not: 'CANCELLED' },
      },
      include: {
        event: {
          include: { region: true, city: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async parentParticipations(user: RequestUser): Promise<unknown> {
    const tenantId = this.requireTenant(user);
    const guardianships = await this.prisma.childGuardian.findMany({
      where: { userId: user.userId },
      select: { childId: true },
    });
    const childIds = guardianships.map((g) => g.childId);
    if (childIds.length === 0) return [];

    return this.prisma.eventChildParticipation.findMany({
      where: {
        assignment: {
          childId: { in: childIds },
          event: { tenantId },
        },
      },
      include: {
        assignment: {
          include: {
            event: { include: { region: true } },
            child: { select: { id: true, nickname: true } },
            application: { select: { id: true, status: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async respondParticipation(
    user: RequestUser,
    participationId: string,
    dto: ParticipationRespondDto,
  ) {
    const row = await this.prisma.eventChildParticipation.findUnique({
      where: { id: participationId },
      include: {
        assignment: {
          include: {
            child: { include: { guardians: true } },
            application: true,
          },
        },
      },
    });
    if (!row) throw new NotFoundException('Participation not found');
    const isGuardian = row.assignment.child.guardians.some((g) => g.userId === user.userId);
    if (!isGuardian) throw new ForbiddenException();

    const updated = await this.prisma.$transaction(async (tx) => {
      const p = await tx.eventChildParticipation.update({
        where: { id: participationId },
        data: {
          status: dto.status as never,
          respondedAt: new Date(),
        },
      });
      await tx.childApplication.update({
        where: { id: row.assignment.applicationId },
        data: {
          status:
            dto.status === 'PARENT_CONFIRMED'
              ? 'PARTICIPATION_CONFIRMED'
              : 'PARTICIPATION_DECLINED',
        },
      });
      return p;
    });

    return updated;
  }

  async listRsvps(user: RequestUser, eventId: string) {
    const tenantId = this.requireTenant(user);
    const event = await this.prisma.event.findFirst({ where: { id: eventId, tenantId } });
    if (!event) throw new NotFoundException('Event not found');
    return this.prisma.eventRiderRSVP.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
