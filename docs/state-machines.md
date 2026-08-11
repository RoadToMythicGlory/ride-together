# Domain State Machines

## ApplicationStatus

```
DRAFT → SUBMITTED → UNDER_REVIEW
  → MORE_INFO_REQUIRED → UNDER_REVIEW
  → VERIFIED → APPROVED
  → WAITLISTED | ASSIGNED_TO_EVENT
  → PARTICIPATION_CONFIRMED | PARTICIPATION_DECLINED
  → COMPLETED

Also: REJECTED | WITHDRAWN | ARCHIVED
```

Every transition writes `ApplicationStatusHistory` (actor, timestamps, from/to, reason).

## EventStatus

```
DRAFT → PLANNING → OPEN_FOR_RIDERS → FULL | CONFIRMED → IN_PROGRESS → COMPLETED
Also: CANCELLED | POSTPONED
```

## RSVPStatus

```
INTERESTED → CONFIRMED | WAITLISTED → CHECKED_IN | NO_SHOW | CANCELLED
```

## EventChildParticipationStatus

```
ASSIGNED → INVITED → PARENT_CONFIRMED | PARENT_DECLINED → ATTENDED | CANCELLED | NO_SHOW
```

Intake pipeline stays on the application; participation tracks per-event continuity.
