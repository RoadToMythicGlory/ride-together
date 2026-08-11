'use client';

import { AppShell, Row } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="rider" title="היסטוריית השתתפות" subtitle="מפגשים קודמים.">
      <div className="space-y-2">
        <Row title="מפגש צפון · הושלם" meta="נכחת" href="/rider/events/demo" />
        <Row title="מפגש מרכז · הושלם" meta="נכחת" href="/rider/events/demo" />
      </div>
    </AppShell>
  );
}
