import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PERMISSIONS, TENANT_ROLES } from '@ride-together/shared';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestUser } from '../../common/request-context';
import { TenantBootstrapService } from './tenant-bootstrap.service';
import {
  AddMemberDto,
  CreateTenantDto,
  SetMemberRolesDto,
} from './dto/tenants.dto';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bootstrap: TenantBootstrapService,
    private readonly audit: AuditService,
  ) {}

  async listMine(user: RequestUser) {
    const memberships = await this.prisma.tenantMembership.findMany({
      where: { userId: user.userId, status: 'ACTIVE' },
      include: {
        tenant: true,
        roles: { include: { role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return memberships.map((m) => ({
      id: m.tenant.id,
      slug: m.tenant.slug,
      name: m.tenant.name,
      isActive: m.tenant.isActive,
      status: m.status,
      roles: m.roles.map((r) => r.role.key),
      isActiveTenant: m.tenantId === user.activeTenantId,
    }));
  }

  async listAll(user: RequestUser) {
    if (!user.platformRoles.includes('SUPER_ADMIN')) {
      throw new ForbiddenException('Platform super admin required');
    }
    const tenants = await this.prisma.tenant.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { memberships: true, events: true, applications: true } },
      },
    });
    return tenants.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      isActive: t.isActive,
      members: t._count.memberships,
      events: t._count.events,
      applications: t._count.applications,
      createdAt: t.createdAt,
    }));
  }

  async create(user: RequestUser, dto: CreateTenantDto) {
    if (!user.platformRoles.includes('SUPER_ADMIN')) {
      throw new ForbiddenException('Platform super admin required');
    }
    const exists = await this.prisma.tenant.findUnique({ where: { slug: dto.slug } });
    if (exists) throw new BadRequestException('Tenant slug already exists');

    const tenant = await this.prisma.tenant.create({
      data: { slug: dto.slug, name: dto.name, isActive: true },
    });
    await this.bootstrap.seedSystemRoles(tenant.id);

    // Super admin joins as tenant ADMIN for operational access
    const membership = await this.prisma.tenantMembership.create({
      data: { tenantId: tenant.id, userId: user.userId, status: 'ACTIVE' },
    });
    const adminRole = await this.prisma.role.findUniqueOrThrow({
      where: { tenantId_key: { tenantId: tenant.id, key: TENANT_ROLES.ADMIN } },
    });
    await this.prisma.membershipRole.create({
      data: { membershipId: membership.id, roleId: adminRole.id },
    });

    await this.audit.log({
      actorUserId: user.userId,
      tenantId: tenant.id,
      action: 'tenant.created',
      entityType: 'Tenant',
      entityId: tenant.id,
      metadata: { slug: tenant.slug },
    });

    return tenant;
  }

  async listMembers(user: RequestUser, tenantId: string) {
    await this.assertCanManageTenant(user, tenantId);
    const members = await this.prisma.tenantMembership.findMany({
      where: { tenantId },
      include: {
        user: { select: { id: true, email: true, fullName: true, isActive: true } },
        roles: { include: { role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return members.map((m) => ({
      membershipId: m.id,
      userId: m.user.id,
      email: m.user.email,
      fullName: m.user.fullName,
      isActive: m.user.isActive,
      status: m.status,
      roles: m.roles.map((r) => r.role.key),
    }));
  }

  async addMember(user: RequestUser, tenantId: string, dto: AddMemberDto) {
    await this.assertCanManageTenant(user, tenantId);
    const target = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!target) throw new NotFoundException('User not found — they must register first');

    const membership = await this.prisma.tenantMembership.upsert({
      where: { tenantId_userId: { tenantId, userId: target.id } },
      update: { status: 'ACTIVE' },
      create: { tenantId, userId: target.id, status: 'ACTIVE' },
    });

    await this.replaceRoles(membership.id, tenantId, dto.roles);
    await this.ensureCapabilityProfiles(target.id, tenantId, dto.roles);

    await this.audit.log({
      actorUserId: user.userId,
      tenantId,
      action: 'tenant.member_added',
      entityType: 'TenantMembership',
      entityId: membership.id,
      metadata: { userId: target.id, roles: dto.roles },
    });

    return { ok: true, userId: target.id, roles: dto.roles };
  }

  async setMemberRoles(
    user: RequestUser,
    tenantId: string,
    memberUserId: string,
    dto: SetMemberRolesDto,
  ) {
    await this.assertCanManageTenant(user, tenantId);
    const membership = await this.prisma.tenantMembership.findUnique({
      where: { tenantId_userId: { tenantId, userId: memberUserId } },
    });
    if (!membership) throw new NotFoundException('Membership not found');

    if (dto.status) {
      await this.prisma.tenantMembership.update({
        where: { id: membership.id },
        data: { status: dto.status },
      });
    }
    await this.replaceRoles(membership.id, tenantId, dto.roles);
    await this.ensureCapabilityProfiles(memberUserId, tenantId, dto.roles);

    await this.audit.log({
      actorUserId: user.userId,
      tenantId,
      action: 'tenant.member_roles_updated',
      entityType: 'TenantMembership',
      entityId: membership.id,
      metadata: { userId: memberUserId, roles: dto.roles, status: dto.status },
    });

    return { ok: true };
  }

  private async replaceRoles(
    membershipId: string,
    tenantId: string,
    roles: string[],
  ) {
    await this.prisma.membershipRole.deleteMany({ where: { membershipId } });
    for (const key of roles) {
      const role = await this.prisma.role.findUniqueOrThrow({
        where: { tenantId_key: { tenantId, key } },
      });
      await this.prisma.membershipRole.create({
        data: { membershipId, roleId: role.id },
      });
    }
  }

  private async ensureCapabilityProfiles(
    userId: string,
    tenantId: string,
    roles: string[],
  ) {
    if (roles.includes(TENANT_ROLES.RIDER)) {
      await this.prisma.riderProfile.upsert({
        where: { userId },
        update: { tenantId },
        create: { userId, tenantId },
      });
    }
    if (roles.includes(TENANT_ROLES.PARENT)) {
      await this.prisma.parentProfile.upsert({
        where: { userId },
        update: { tenantId },
        create: { userId, tenantId },
      });
    }
  }

  private async assertCanManageTenant(user: RequestUser, tenantId: string) {
    if (user.platformRoles.includes('SUPER_ADMIN')) return;
    if (user.activeTenantId !== tenantId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }
    if (
      !user.permissions.includes(PERMISSIONS.USERS_MANAGE) &&
      !user.tenantRoles.includes(TENANT_ROLES.ADMIN)
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
