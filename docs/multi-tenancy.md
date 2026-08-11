# Multi-Tenancy Design

## Model

```
User ──< TenantMembership >── Tenant
                │
          MembershipRole >── Role >── RolePermission >── Permission

User ── PlatformRoleAssignment (SUPER_ADMIN only)
```

- Operational rows carry `tenant_id`.
- Membership is independent of platform authority.
- Users may belong to multiple tenants in the future; JWT carries `activeTenantId`.

## Isolation rules

1. Tenant-scoped APIs require verified membership for `activeTenantId`.
2. Repository/service layer always filters by tenant unless `PlatformScope` + SUPER_ADMIN.
3. Never authorize solely because a resource ID exists (prevent IDOR).
4. Frontend filtering is never a security boundary.

## Future tenant hooks

TenantSettings for branding, region packs, moderation, and notification rules (not Phase 1 UI).
