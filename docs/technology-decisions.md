# Technology Decisions

| Layer | Choice | Why |
|---|---|---|
| Monorepo | pnpm + Turborepo | Shared contracts; clear app boundaries |
| API | NestJS | DI, guards, modules, long-term scale |
| Web | Next.js App Router + Tailwind | Mobile-first PWA, Hebrew RTL |
| DB | PostgreSQL 16 + Prisma | Integrity, migrations, outbox |
| Queue | Redis + BullMQ | Async fan-out after outbox relay |
| Auth | Passport JWT + refresh rotation | First-party authorization |
| Push | FCM behind `PushProvider` | Swappable providers |
| Storage | S3-compatible (MinIO locally) | Signed uploads |
| Logs | Pino | Structured, production-ready |

## Explicit non-choices

- No microservices in Phase 1–5.
- No child social graph / DMs / public child profiles.
- No in-memory domain event bus as source of truth.
- `SUPER_ADMIN` is not a tenant membership role.
