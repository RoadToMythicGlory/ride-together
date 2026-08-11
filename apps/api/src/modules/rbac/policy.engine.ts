import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  PLATFORM_ROLES,
  assertTenantScope,
  isPlatformSuperAdmin,
  type Permission,
  type PlatformRole,
  type TenantRole,
} from '@ride-together/shared';
import type { RequestUser } from '../../common/request-context';

@Injectable()
export class PolicyEngine {
  toContext(user: RequestUser) {
    return {
      userId: user.userId,
      platformRoles: user.platformRoles,
      tenantId: user.activeTenantId,
      tenantRoles: user.tenantRoles,
    };
  }

  hasPermission(user: RequestUser, permission: Permission) {
    if (user.platformRoles.includes(PLATFORM_ROLES.SUPER_ADMIN)) return true;
    return (user.permissions ?? []).includes(permission);
  }

  requirePermission(user: RequestUser, permission: Permission) {
    if (!this.hasPermission(user, permission)) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }
  }

  requireTenantAccess(user: RequestUser, resourceTenantId: string) {
    if (!assertTenantScope(this.toContext(user), resourceTenantId)) {
      throw new ForbiddenException('Cross-tenant access denied');
    }
  }

  requirePlatformSuperAdmin(user: RequestUser) {
    if (!isPlatformSuperAdmin(this.toContext(user))) {
      throw new ForbiddenException('Platform super admin required');
    }
  }

  isSuperAdmin(user: RequestUser) {
    return isPlatformSuperAdmin(this.toContext(user));
  }

  hasAnyRole(user: RequestUser, roles: TenantRole[]) {
    return roles.some((r) => user.tenantRoles.includes(r));
  }

  platformRoles(user: RequestUser): PlatformRole[] {
    return user.platformRoles;
  }
}
