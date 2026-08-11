'use client';

import { AppShell, Row } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="admin" title="יומן ביקורת" subtitle="פעולות רגישות.">
      <div className="space-y-2">
        <Row title="user.login · Platform Admin" meta="לפני דקה" href="/admin/audit" />
        <Row title="notification_regions.updated" meta="היום" href="/admin/audit" />
      </div>
    </AppShell>
  );
}
