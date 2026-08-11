# App Store / Play Store compliance — RideTogether

## Declared product posture

| Item | Value |
|------|--------|
| Audience | Adults 18+ only (parents/guardians, riders, event managers, admins) |
| Kids Category | **No** — do not submit under Kids / Designed for Families |
| Age rating (suggested) | **17+** |
| Children as users | **Never** — no child accounts, DMs, or public child profiles |
| Child data | Submitted only by parent/guardian; private split (`ChildPrivateData`) |

## Apple App Store checklist

| Guideline | Status in product |
|-----------|-------------------|
| 5.1.1 Privacy Policy URL | `/privacy` (in-app + web) — **done** |
| 5.1.1(v) Account deletion | `/settings/delete` + `DELETE /api/me` — **done** |
| Data access / export | `/settings/export` + `GET /api/me/export` |
| Terms of Use | `/terms` |
| Support URL | `/contact` + `support@ride-together.local` |
| Age gate at signup | 18+ attestation required |
| Not a Kids app | Explicit copy on landing, about, safety, register |
| UGC / media | Not public until moderation exists — keep media private |
| Email verify / password reset | Backend flows implemented |
| Capacitor native scaffold | `apps/mobile` (point `CAPACITOR_SERVER_URL` at prod HTTPS before submit) |
| Live App Review demo flows | Apply → approve → RSVP paths available |

### App Privacy (nutrition labels) — draft answers

- **Contact info:** name, email, phone (optional) — Account functionality
- **Other user content:** meetup RSVPs, parent applications — App functionality
- **Sensitive info:** medical/accessibility notes about children (via parent only) — App functionality; not used for tracking
- **Identifiers:** device token when push is enabled — App functionality / notifications
- **Tracking:** None currently (no advertising SDKs)
- **Data linked to user:** Yes for account fields
- **Data used to track:** No

### Review notes (paste for App Review)

> RideTogether is an adult-only community coordination app for motorcycle support meetups in Israel. Children never create accounts or use the app. Parents/guardians may submit information about a child for real-world meetup planning; riders only see non-identifying public meetup summaries. Demo admin: `admin@ride-together.local` / `ChangeMe123!`. Account deletion: Settings → delete account.

## Google Play

| Item | Value |
|------|--------|
| Target audience | 18+ |
| Families / Designed for Families | **Do not enroll** |
| Data safety | Declare child-related data collected via parents; deletion + export available |
| Account deletion | In-app path required (implemented) |

## Native wrapper (when shipping to App Store)

This repo is a Next.js PWA. Capacitor scaffold lives in `apps/mobile`:

1. Wrap with Capacitor pointing at production HTTPS URL (see `apps/mobile/README.md`)
2. Replace placeholder icons in `apps/web/public/icons/` and `apps/mobile/resources/icon-1024.png` with branded masters
3. Add iOS `NS*` permission strings only when enabling camera/photos/push
4. Do not request location permission unless GPS is actually used (regions are city/region prefs, not GPS)
5. Keep push payloads free of child PII (nickname-only if any)

## Remaining before production review

- [ ] Real support email / production domain (replace `.local`; set Capacitor `server.url` to HTTPS)
- [ ] Legal counsel review of Privacy/Terms (Hebrew + English URLs)
