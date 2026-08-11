import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly outbox: OutboxService,
  ) {}

  async getMe(
    userId: string,
    activeTenantId: string | null,
    permissions: string[] = [],
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        platformRoles: true,
        riderProfile: true,
        parentProfile: true,
        memberships: {
          where: { status: 'ACTIVE' },
          include: {
            tenant: true,
            roles: { include: { role: true } },
          },
        },
        notificationRegions: {
          where: activeTenantId ? { tenantId: activeTenantId } : undefined,
          include: { region: true, city: true },
        },
        consents: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!user || !user.isActive) throw new NotFoundException('User not found');

    const membership =
      user.memberships.find((m) => m.tenantId === activeTenantId) ??
      user.memberships[0] ??
      null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      locale: user.locale,
      emailVerified: Boolean(user.emailVerifiedAt),
      platformRoles: user.platformRoles.map((r) => r.role),
      activeTenant: membership
        ? { id: membership.tenant.id, slug: membership.tenant.slug, name: membership.tenant.name }
        : null,
      tenantRoles: membership?.roles.map((r) => r.role.key) ?? [],
      permissions,
      memberships: user.memberships.map((m) => ({
        tenantId: m.tenant.id,
        slug: m.tenant.slug,
        name: m.tenant.name,
        roles: m.roles.map((r) => r.role.key),
        isActive: m.tenantId === activeTenantId,
      })),
      capabilities: {
        rider: Boolean(user.riderProfile),
        parent: Boolean(user.parentProfile),
      },
      notificationRegions: user.notificationRegions.map((n) => ({
        id: n.id,
        regionId: n.regionId,
        cityId: n.cityId,
        region: n.region
          ? { id: n.region.id, key: n.region.key, nameHe: n.region.nameHe }
          : null,
        city: n.city
          ? { id: n.city.id, key: n.city.key, nameHe: n.city.nameHe }
          : null,
      })),
      consents: user.consents.map((c) => ({
        consentType: c.consentType,
        version: c.version,
        accepted: c.accepted,
        createdAt: c.createdAt,
      })),
    };
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        locale: dto.locale,
      },
    });
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      locale: user.locale,
    };
  }

  /** GDPR / Apple 5.1.1 — portable copy of the account holder's data */
  async exportMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        platformRoles: true,
        riderProfile: true,
        parentProfile: true,
        memberships: {
          include: {
            tenant: true,
            roles: { include: { role: true } },
          },
        },
        notificationRegions: { include: { region: true, city: true } },
        consents: true,
        eventRsvps: true,
        submittedApplications: {
          select: {
            id: true,
            status: true,
            reasonSummary: true,
            createdAt: true,
            updatedAt: true,
            childId: true,
          },
        },
        guardianships: {
          include: {
            child: {
              include: { privateData: true },
            },
          },
        },
        devices: {
          select: { id: true, platform: true, createdAt: true },
        },
      },
    });
    if (!user || !user.isActive) throw new NotFoundException('User not found');

    return {
      exportedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        locale: user.locale,
        createdAt: user.createdAt,
        platformRoles: user.platformRoles.map((r) => r.role),
        memberships: user.memberships.map((m) => ({
          tenant: m.tenant.slug,
          roles: m.roles.map((r) => r.role.key),
          status: m.status,
        })),
        capabilities: {
          rider: Boolean(user.riderProfile),
          parent: Boolean(user.parentProfile),
        },
      },
      notificationRegions: user.notificationRegions,
      consents: user.consents,
      eventRsvps: user.eventRsvps,
      applications: user.submittedApplications,
      guardianships: user.guardianships.map((g) => ({
        relationship: g.relationship,
        isPrimary: g.isPrimary,
        child: {
          id: g.child.id,
          nickname: g.child.nickname,
          ageYears: g.child.ageYears,
          privateData: g.child.privateData
            ? {
                fullName: g.child.privateData.fullName,
                medicalSupportNotes: g.child.privateData.medicalSupportNotes,
                accessibilityNotes: g.child.privateData.accessibilityNotes,
                schoolOrHomeNotes: g.child.privateData.schoolOrHomeNotes,
                privateStory: g.child.privateData.privateStory,
              }
            : null,
        },
      })),
      devices: user.devices,
    };
  }

  /**
   * Apple App Store 5.1.1(v) / Google Play: in-app account deletion.
   * Soft-deletes + anonymizes; clears child private data when this user is sole guardian.
   */
  async deleteAccount(userId: string, confirmation: string) {
    if (confirmation !== 'DELETE') {
      throw new BadRequestException('Type DELETE to confirm account deletion');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: true,
        guardianships: { include: { child: { include: { guardians: true } } } },
      },
    });
    if (!user || !user.isActive) throw new NotFoundException('User not found');

    const tenantId = user.memberships[0]?.tenantId ?? null;
    const burnedPassword = await bcrypt.hash(randomBytes(32).toString('hex'), 12);
    const anonEmail = `deleted_${userId}@deleted.local`;

    await this.prisma.$transaction(async (tx) => {
      for (const g of user.guardianships) {
        const soleGuardian = g.child.guardians.length <= 1;
        if (soleGuardian) {
          await tx.childPrivateData.updateMany({
            where: { childId: g.childId },
            data: {
              fullName: null,
              privateStory: null,
              medicalSupportNotes: null,
              accessibilityNotes: null,
              schoolOrHomeNotes: null,
              internalStaffNotes: null,
            },
          });
          await tx.child.update({
            where: { id: g.childId },
            data: {
              nickname: 'מחוק',
              supportCategory: null,
              isVerified: false,
            },
          });
        }
      }

      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.device.deleteMany({ where: { userId } });
      await tx.userNotificationRegion.deleteMany({ where: { userId } });

      await tx.tenantMembership.updateMany({
        where: { userId },
        data: { status: 'SUSPENDED' },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          email: anonEmail,
          fullName: 'משתמש שנמחק',
          phone: null,
          passwordHash: burnedPassword,
          isActive: false,
        },
      });

      await this.outbox.enqueue(
        {
          tenantId,
          aggregateType: 'User',
          aggregateId: userId,
          eventType: 'UserAccountDeleted',
          payload: { userId },
          idempotencyKey: `user-deleted:${userId}:${Date.now()}`,
        },
        tx,
      );
    });

    await this.audit.log({
      actorUserId: userId,
      tenantId,
      action: 'user.account_deleted',
      entityType: 'User',
      entityId: userId,
    });

    return { ok: true, deleted: true };
  }
}
