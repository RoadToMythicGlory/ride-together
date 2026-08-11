# Ride Together

Adult-only coordination platform for motorcycle community support meetups in Israel.

Parents and guardians apply on behalf of children. Community organizers review applications and plan events. Verified adult riders RSVP and show up in person.

**Children never have accounts, messaging, or public profiles.**

---

## Why this exists

Ride Together is built for real-world presence, not social engagement. The product model is deliberately narrow:

- Adults coordinate. Children are beneficiaries, not users.
- Riders see public meetup summaries — never private child stories, schools, or addresses.
- Authorization is server-side and tenant-scoped. Side effects go through a transactional outbox.

## Monorepo

```text
apps/
  api/       NestJS HTTP API
  worker/    BullMQ consumers + outbox relay
  web/       Next.js PWA (Hebrew RTL-first)
  mobile/    Capacitor shell (iOS / Android)
packages/
  database/  Prisma schema + client
  shared/    Permissions, enums, Zod contracts
  config/    Shared env loading
docs/        Architecture, ERD, RBAC, threat model
```

## Stack

| Layer | Choice |
| --- | --- |
| API | NestJS (modular monolith) |
| Web | Next.js PWA, Hebrew RTL |
| Data | PostgreSQL + Prisma |
| Jobs | Redis + BullMQ |
| Media | MinIO (S3-compatible) |
| Mobile | Capacitor around the web app |

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) 9+
- Docker (Postgres, Redis, MinIO)

## Quick start

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm --filter @ride-together/api dev
pnpm --filter @ride-together/web dev
```

| Service | URL |
| --- | --- |
| Web | http://localhost:3000 |
| API | http://localhost:3001 |

Seeded platform admin: `admin@ride-together.local` / `ChangeMe123!`

Change that password before any shared or production environment.

## Safety constraints

These are product rules, not UI copy:

1. No child accounts or child-facing surfaces.
2. Sensitive child data lives in `ChildPrivateData` and is excluded from rider DTOs.
3. Geo notifications subscribe to city **or** region — never auto-expanded.
4. Consents are typed and versioned.
5. Cross-tenant access is blocked by membership + permission + resource tenant match.

See [`docs/threat-model.md`](docs/threat-model.md) for the full threat / mitigation matrix.

## Documentation

| Doc | Contents |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | System shape, trust flow, modules |
| [`docs/erd.md`](docs/erd.md) | Data model |
| [`docs/rbac-matrix.md`](docs/rbac-matrix.md) | Platform and tenant permissions |
| [`docs/multi-tenancy.md`](docs/multi-tenancy.md) | Tenant isolation |
| [`docs/state-machines.md`](docs/state-machines.md) | Application / event workflows |
| [`docs/notifications.md`](docs/notifications.md) | Outbox → push pipeline |
| [`docs/store-compliance.md`](docs/store-compliance.md) | App Store / Play notes |
| [`docs/roadmap.md`](docs/roadmap.md) | Delivery phases |

## Scripts

```bash
pnpm dev          # turbo: all package dev tasks
pnpm build
pnpm lint
pnpm test
pnpm db:studio    # Prisma Studio
```

## License

MIT — see [LICENSE](LICENSE).
