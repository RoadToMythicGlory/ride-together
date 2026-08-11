'use client';

import { AppShell, GhostButton, Panel, PrimaryButton, StatusPill } from '@/components/app-shell';
import { MeetupBriefBlock } from '@/components/manifest/meetup-brief';
import { DEMO_MEETUP_SHARON } from '@/content/meetups';

export default function Page() {
  return (
    <AppShell area="manager" title="תפעול מפגש" subtitle="פרסום, קיבולת, ומידע למשתתפים.">
      <Panel>
        <StatusPill>OPEN_FOR_RIDERS</StatusPill>
        <p className="mt-3 font-semibold">Community Ride · שרון</p>
        <p className="text-sm text-muted">ילדים משובצים: 9 · רוכבים: 18/60</p>
        <MeetupBriefBlock brief={DEMO_MEETUP_SHARON} className="mt-4" />
      </Panel>
      <div className="mt-4 space-y-3">
        <PrimaryButton href="/manager/events/demo/attendance">ניהול נוכחות</PrimaryButton>
        <GhostButton href="/manager/notifications">שלח גיוס רוכבים</GhostButton>
        <GhostButton href="/manager">סמן כמאושר / דחה / בטל</GhostButton>
      </div>
    </AppShell>
  );
}
