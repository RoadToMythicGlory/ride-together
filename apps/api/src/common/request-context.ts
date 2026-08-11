import type { Permission, PlatformRole, TenantRole } from '@ride-together/shared';

export interface RequestUser {
  userId: string;
  email: string;
  platformRoles: PlatformRole[];
  activeTenantId: string | null;
  tenantRoles: TenantRole[];
  /** Resolved from DB RolePermission for the active tenant membership (+ platform). */
  permissions: Permission[];
}
