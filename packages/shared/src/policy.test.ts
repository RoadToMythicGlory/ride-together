import { describe, expect, it } from 'vitest';
import {
  assertTenantScope,
  hasPermission,
  isPlatformSuperAdmin,
  PERMISSIONS,
} from './index.js';

describe('RBAC policy engine', () => {
  it('grants platform SUPER_ADMIN all permissions without tenant role', () => {
    const ctx = {
      userId: 'u1',
      platformRoles: ['SUPER_ADMIN' as const],
      tenantId: null,
      tenantRoles: [],
    };
    expect(isPlatformSuperAdmin(ctx)).toBe(true);
    expect(hasPermission(ctx, PERMISSIONS.TENANTS_MANAGE)).toBe(true);
    expect(hasPermission(ctx, PERMISSIONS.APPLICATIONS_REVIEW)).toBe(true);
  });

  it('does not treat ADMIN as platform super admin', () => {
    const ctx = {
      userId: 'u2',
      platformRoles: [],
      tenantId: 't1',
      tenantRoles: ['ADMIN' as const],
    };
    expect(isPlatformSuperAdmin(ctx)).toBe(false);
    expect(hasPermission(ctx, PERMISSIONS.TENANTS_MANAGE)).toBe(false);
    expect(hasPermission(ctx, PERMISSIONS.USERS_MANAGE)).toBe(true);
  });

  it('allows composable RIDER + PARENT capabilities', () => {
    const ctx = {
      userId: 'u3',
      platformRoles: [],
      tenantId: 't1',
      tenantRoles: ['RIDER' as const, 'PARENT' as const],
    };
    expect(hasPermission(ctx, PERMISSIONS.RSVP_MANAGE_OWN)).toBe(true);
    expect(hasPermission(ctx, PERMISSIONS.APPLICATIONS_CREATE)).toBe(true);
    expect(hasPermission(ctx, PERMISSIONS.CHILD_PRIVATE_READ)).toBe(true);
  });

  it('enforces tenant isolation unless platform super admin', () => {
    const tenantUser = {
      userId: 'u4',
      platformRoles: [],
      tenantId: 't1',
      tenantRoles: ['EVENT_MANAGER' as const],
    };
    expect(assertTenantScope(tenantUser, 't1')).toBe(true);
    expect(assertTenantScope(tenantUser, 't2')).toBe(false);

    const superAdmin = {
      userId: 'u5',
      platformRoles: ['SUPER_ADMIN' as const],
      tenantId: null,
      tenantRoles: [],
    };
    expect(assertTenantScope(superAdmin, 't2')).toBe(true);
  });

  it('denies riders applications:review', () => {
    const ctx = {
      userId: 'u6',
      platformRoles: [],
      tenantId: 't1',
      tenantRoles: ['RIDER' as const],
    };
    expect(hasPermission(ctx, PERMISSIONS.APPLICATIONS_REVIEW)).toBe(false);
  });
});
