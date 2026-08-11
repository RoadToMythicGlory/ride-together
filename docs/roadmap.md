# Development Roadmap

| Phase | Scope |
|---|---|
| 0 – Docs | Architecture foundation (this folder) |
| 1 – Foundation | Monorepo, Docker, Prisma core, Auth, platform/tenant RBAC, profiles, geography, outbox table, audit, `/me` |
| 2 – Applications | Child + ChildPrivateData, guardians, workflow, consents, manager review |
| 3 – Events | Events, assignment + participation, RSVP/capacity/waitlist |
| 4 – Notifications | Outbox relay → FCM, geo targeting, assignment push, reminders |
| 5 – Operations | Attendance, history, recurring invites, analytics, moderation, media |

Phase 1 intentionally ships no full feature UIs beyond a Hebrew RTL shell and auth wiring stubs.
