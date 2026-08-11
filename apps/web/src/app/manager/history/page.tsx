'use client';

import { AppShell, Row } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="manager" title="היסטוריית מפגשים" subtitle="מפגשים שהסתיימו.">
      <div className="space-y-2">
        <Row title="מפגש שרון · מרץ" meta="הושלם · 52 רוכבים" href="/manager/events/demo/ops" />
        <Row title="מפגש צפון · פברואר" meta="הושלם · 41 רוכבים" href="/manager/events/demo/ops" />
      </div>
    </AppShell>
  );
}
