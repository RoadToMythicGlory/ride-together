# RBAC Matrix

## Scope rules

| Role | Scope | Storage |
|---|---|---|
| SUPER_ADMIN | Platform | `PlatformRoleAssignment` |
| ADMIN | Tenant | `MembershipRole` |
| EVENT_MANAGER | Tenant | `MembershipRole` |
| RIDER | Tenant | `MembershipRole` |
| PARENT | Tenant | `MembershipRole` |

A user may hold both RIDER and PARENT on the same tenant membership.

## Permissions

| Permission | SUPER_ADMIN | ADMIN | EVENT_MANAGER | RIDER | PARENT |
|---|---|---|---|---|---|
| tenants:manage | Y | | | | |
| platform:users:manage | Y | | | | |
| users:manage | Y | Y | | | |
| roles:manage | Y | Y | | | |
| regions:manage | Y | Y | | | |
| settings:manage | Y | Y | | | |
| audit:read | Y | Y (tenant) | | | |
| analytics:read | Y | Y | scoped | | |
| moderation:manage | Y | Y | | | |
| applications:create | | | | Y* | Y |
| applications:read_own | | | | Y* | Y |
| applications:review | Y | Y | Y | | |
| applications:assign | Y | Y | Y | | |
| child_private:read | Y | Y | Y | | Y* |
| events:create | Y | Y | Y | | |
| events:publish | Y | Y | Y | | |
| events:read_public | Y | Y | Y | Y | Y |
| events:manage | Y | Y | Y | | |
| rsvp:manage_own | | | | Y | |
| attendance:record | Y | Y | Y | | |
| notifications:campaign | Y | Y | Y | | |
| consents:manage_own | | | | Y* | Y |
| media:moderate | Y | Y | Y | | |

\*Guardian/parent (or rider-as-guardian) on that child/application only.

## Enforcement

`PoliciesGuard` + `@RequirePermission(...)` evaluates platform role **or** tenant membership permissions, then resource tenant/ownership scope.
