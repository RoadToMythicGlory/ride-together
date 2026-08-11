# Repository Structure

```text
ride-together/
  apps/
    api/                 # NestJS HTTP API
    worker/              # BullMQ + outbox relay
    web/                 # Next.js PWA
  packages/
    database/            # Prisma schema, migrations, client, seed
    shared/              # permissions, enums, zod schemas
    config/              # env schema helpers
    tsconfig/            # shared TS configs
  docs/                  # architecture foundation
  docker-compose.yml
  package.json
  pnpm-workspace.yaml
  turbo.json
  README.md
```

API modules live under `apps/api/src/modules/<name>/` with thin controllers and service/domain layers.
