import { Injectable } from '@nestjs/common';
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  TENANT_ROLES,
  type TenantRole,
} from '@ride-together/shared';
import { PrismaService } from '../../prisma/prisma.service';

/** Ensures permission catalog + system roles exist for a tenant. */
@Injectable()
export class TenantBootstrapService {
  constructor(private readonly prisma: PrismaService) {}

  async ensurePermissionCatalog() {
    for (const key of Object.values(PERMISSIONS)) {
      await this.prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key, description: key },
      });
    }
  }

  async seedSystemRoles(tenantId: string) {
    await this.ensurePermissionCatalog();
    const permissions = await this.prisma.permission.findMany();
    const byKey = new Map(permissions.map((p) => [p.key, p.id]));

    for (const roleKey of Object.values(TENANT_ROLES) as TenantRole[]) {
      const role = await this.prisma.role.upsert({
        where: { tenantId_key: { tenantId, key: roleKey } },
        update: { name: roleKey, isSystem: true },
        create: {
          tenantId,
          key: roleKey,
          name: roleKey,
          isSystem: true,
        },
      });

      for (const perm of ROLE_PERMISSIONS[roleKey]) {
        const permissionId = byKey.get(perm);
        if (!permissionId) continue;
        await this.prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: role.id, permissionId },
          },
          update: {},
          create: { roleId: role.id, permissionId },
        });
      }
    }
  }
}
