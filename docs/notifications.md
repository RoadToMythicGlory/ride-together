# Push Notification Architecture

## Flow

1. API mutates domain + inserts `OutboxEvent` in one Postgres transaction.
2. Outbox relay claims unpublished rows and enqueues BullMQ jobs.
3. Worker resolves recipients (tenant, role, city/region prefs, consent).
4. Worker writes in-app `Notification`, sends via `PushProvider`, records `NotificationDelivery`.

## Providers

- `PushProvider` (FCM now)
- Future: EmailProvider, SMSProvider

## Geo targeting

Intersection of event `city_id` / `region_id` with `UserNotificationRegion` rows.

- City subscription matches event city.
- Region subscription matches event region.
- Selecting cities does **not** imply the whole region.

## Critical parent assignment copy (Hebrew)

```
יש לנו מפגש עבורכם ❤️
הבקשה עבור [preferred child name] שובצה למפגש קהילתי.
פתחו את האפליקציה כדי לראות את הפרטים ולאשר השתתפות.
```

No sensitive details in the push body. Deep link to the parent application/event screen.

## Deduplication

Key: `(userId, type, entityId, bucket)` for campaigns and reminders.
