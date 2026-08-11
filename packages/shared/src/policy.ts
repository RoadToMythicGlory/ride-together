import {
  PLATFORM_PERMISSIONS,
  PLATFORM_ROLES,
  ROLE_PERMISSIONS,
  type Permission,
  type PlatformRole,
  type TenantRole,
} from './permissions.js';

export interface AuthzContext {
  userId: string;
  platformRoles: PlatformRole[];
  tenantId: string | null;
  tenantRoles: TenantRole[];
}

export function collectPermissions(ctx: AuthzContext): Set<Permission> {
  const set = new Set<Permission>();
  for (const role of ctx.platformRoles) {
    for (const p of PLATFORM_PERMISSIONS[role] ?? []) set.add(p);
  }
  for (const role of ctx.tenantRoles) {
    for (const p of ROLE_PERMISSIONS[role] ?? []) set.add(p);
  }
  return set;
}

export function hasPermission(ctx: AuthzContext, permission: Permission): boolean {
  return collectPermissions(ctx).has(permission);
}

export function isPlatformSuperAdmin(ctx: AuthzContext): boolean {
  return ctx.platformRoles.includes(PLATFORM_ROLES.SUPER_ADMIN);
}

export function assertTenantScope(
  ctx: AuthzContext,
  resourceTenantId: string,
): boolean {
  if (isPlatformSuperAdmin(ctx)) return true;
  return ctx.tenantId !== null && ctx.tenantId === resourceTenantId;
}
