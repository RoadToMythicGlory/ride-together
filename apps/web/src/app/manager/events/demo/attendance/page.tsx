'use client';

import { AppShell, Panel, Row } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="manager" title="נוכחות רוכבים" subtitle="RSVP · CHECKED_IN · NO_SHOW">
      <Panel><p className="text-sm">מאושרים: 18 · בהמתנה: 4 · נכחו: 0</p></Panel>
      <div className="mt-3 space-y-2">
        <Row title="רוכב א׳" meta="CONFIRMED" />
        <Row title="רוכב ב׳" meta="WAITLISTED" />
        <Row title="רוכב ג׳" meta="INTERESTED" />
      </div>
    </AppShell>
  );
}
