import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PERMISSIONS } from '@ride-together/shared';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestUser } from '../../common/request-context';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private requireTenant(user: RequestUser) {
    if (!user.activeTenantId) throw new BadRequestException('No active tenant');
    return user.activeTenantId;
  }

  async listRoles(user: RequestUser) {
    const tenantId = this.requireTenant(user);
    const roles = await this.prisma.role.findMany({
      where: { tenantId },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { memberships: true } },
      },
      orderBy: { key: 'asc' },
    });
    return roles.map((r) => ({
      id: r.id,
      key: r.key,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      memberCount: r._count.memberships,
      permissions: r.permissions.map((p) => p.permission.key),
    }));
  }

  async listPermissions() {
    const rows = await this.prisma.permission.findMany({ orderBy: { key: 'asc' } });
    return rows.map((p) => ({ key: p.key, description: p.description }));
  }

  async setRolePermissions(user: RequestUser, roleKey: string, permissionKeys: string[]) {
    if (
      !user.platformRoles.includes('SUPER_ADMIN') &&
      !user.permissions.includes(PERMISSIONS.ROLES_MANAGE)
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }
    const tenantId = this.requireTenant(user);
    const role = await this.prisma.role.findUnique({
      where: { tenantId_key: { tenantId, key: roleKey } },
    });
    if (!role) throw new NotFoundException('Role not found');

    const perms = await this.prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
    });
    if (perms.length !== permissionKeys.length) {
      throw new BadRequestException('One or more permissions are invalid');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
      for (const p of perms) {
        await tx.rolePermission.create({
          data: { roleId: role.id, permissionId: p.id },
        });
      }
    });

    await this.audit.log({
      actorUserId: user.userId,
      tenantId,
      action: 'role.permissions_updated',
      entityType: 'Role',
      entityId: role.id,
      metadata: { roleKey, permissionKeys },
    });

    return this.listRoles(user).then((roles) => roles.find((r) => r.key === roleKey));
  }
}
