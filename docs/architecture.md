# RideTogether — Architecture

## Product

RideTogether is a non-profit operational platform connecting parents/guardians, verified child applications, community event managers, and motorcycle riders for supportive community gatherings in Israel.

**Children are never application users.** They have no accounts, messaging, public profiles, or direct interaction with unknown adults through the platform.

## Style

Modular monolith:

- `apps/api` — NestJS HTTP API
- `apps/worker` — BullMQ consumers + outbox relay
- `apps/web` — Next.js PWA (public, rider, parent, manager, admin route groups)
- `packages/database` — Prisma schema/client
- `packages/shared` — enums, permissions, Zod contracts

## Trust flow

```
Client → JWT AuthN → PlatformScope and/or TenantContext → PolicyEngine
  → Domain service → Prisma (tenant-scoped) + OutboxEvent (same TX)
```

## Core principles

1. Authorization is server-side and centralized (PolicyEngine).
2. `SUPER_ADMIN` is platform-scoped; tenant roles are membership-scoped.
3. Sensitive child data lives in `ChildPrivateData`, never in rider DTOs.
4. Side effects use a Postgres transactional outbox; Redis/BullMQ is execution only.
5. Geo notification subscriptions are city **or** region (never auto-expanded).

## Bounded modules

Auth, Users, Tenants, RBAC, Geography, RiderProfiles, ParentProfiles, Children, Applications, Events, RSVP, Notifications, Devices, Campaigns, Consents, Media, Audit, Moderation, Analytics, SystemSettings, Outbox.

## Scalability baseline

Stateless API nodes, horizontal workers, Redis coordination, DB indexes on `tenant_id` / status / geo, connection pooling, idempotent jobs, S3 media, structured logging.
