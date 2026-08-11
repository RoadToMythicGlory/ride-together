import { describe, expect, it } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { PERMISSIONS } from '@ride-together/shared';
import type { RequestUser } from '../../common/request-context';
import { PolicyEngine } from './policy.engine';

describe('PolicyEngine', () => {
  const engine = new PolicyEngine();

  it('requires permission and throws on missing', () => {
    const rider: RequestUser = {
      userId: '1',
      email: 'r@example.com',
      platformRoles: [],
      activeTenantId: 't1',
      tenantRoles: ['RIDER'],
      permissions: [PERMISSIONS.EVENTS_READ_PUBLIC, PERMISSIONS.RSVP_MANAGE_OWN],
    };
    expect(() =>
      engine.requirePermission(rider, PERMISSIONS.APPLICATIONS_REVIEW),
    ).toThrow(ForbiddenException);
  });

  it('blocks cross-tenant access for tenant-scoped users', () => {
    const manager: RequestUser = {
      userId: '2',
      email: 'm@example.com',
      platformRoles: [],
      activeTenantId: 't1',
      tenantRoles: ['EVENT_MANAGER'],
      permissions: [PERMISSIONS.APPLICATIONS_REVIEW],
    };
    expect(() => engine.requireTenantAccess(manager, 't2')).toThrow(
      ForbiddenException,
    );
  });

  it('allows platform SUPER_ADMIN across tenants', () => {
    const admin: RequestUser = {
      userId: '3',
      email: 'a@example.com',
      platformRoles: ['SUPER_ADMIN'],
      activeTenantId: null,
      tenantRoles: [],
      permissions: [],
    };
    expect(() => engine.requireTenantAccess(admin, 'any-tenant')).not.toThrow();
    expect(() => engine.requirePlatformSuperAdmin(admin)).not.toThrow();
    expect(engine.hasPermission(admin, PERMISSIONS.TENANTS_MANAGE)).toBe(true);
  });
});
