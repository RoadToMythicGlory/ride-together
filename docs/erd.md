# PostgreSQL ERD

## Core entities

- **Identity:** User, PlatformRoleAssignment, Tenant, TenantMembership, Role, Permission, RolePermission, MembershipRole
- **Profiles:** RiderProfile, ParentProfile
- **Children:** Child, ChildPrivateData (1:1), ChildGuardian, ChildApplication, ApplicationStatusHistory, Consent
- **Events:** Event, EventChildAssignment, EventChildParticipation, EventRiderRSVP
- **Geography:** GeographicRegion, City, UserNotificationRegion (`city_id` XOR `region_id`)
- **Notifications:** Device, Notification, NotificationDelivery, NotificationCampaign
- **Infra:** OutboxEvent, MediaAsset, AuditLog

## Child privacy split

| Entity | Contents |
|---|---|
| `Child` | id, tenant, nickname, age/range, city/region, non-sensitive category, flags |
| `ChildPrivateData` | full name, private story, medical/support context, sensitive accessibility, staff notes |

Rider-facing queries must never join `ChildPrivateData`.

## Assignment vs participation

- `EventChildAssignment` — placement on an event (capacity/ops).
- `EventChildParticipation` — lifecycle: ASSIGNED → INVITED → PARENT_CONFIRMED/DECLINED → ATTENDED/CANCELLED/NO_SHOW.

## Indexes (minimum)

- `(tenant_id, status)`, `(tenant_id, created_at)` on operational tables
- Targeting: `(tenant_id, city_id)`, `(tenant_id, region_id)` on subscriptions
- Event date indexes for discovery
- Partial unique RSVP for active states
- Outbox: unpublished + `available_at` for relay polling
