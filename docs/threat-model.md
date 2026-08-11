# Privacy & Security Threat Model

| Threat | Mitigation |
|---|---|
| Child becomes platform user / DM target | No child accounts; no child messaging |
| Rider sees private story / address / school | `ChildPrivateData` never in rider queries; audited staff/parent access |
| IDOR across tenants | Membership + permission + resource tenant match |
| Fake tenant super-admin | SUPER_ADMIN is platform-only |
| Location leaks home | Location visibility policy; meeting point default |
| Notification PII leak | Template allowlist; nickname only in push body |
| Lost side effects after commit | Transactional Postgres outbox |
| Over-broad geo spam | Separate city vs region subscriptions |
| Capacity race | DB transaction + row lock; waitlist job |
| Consent creep | Per-type versioned Consent rows |
| Token theft | Short access TTL; rotating refresh tokens |
| Upload abuse | Signed S3 PUT; moderation before public visibility |
| Brute force / abuse | Rate limits; lockout-ready auth |

## Visibility model

Sensitive fields map to: `PRIVATE_STAFF` | `PARENT_VISIBLE` | `PARTICIPANT_VISIBLE` | `PUBLIC_SUMMARY`.
