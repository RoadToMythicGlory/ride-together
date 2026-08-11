'use client';

import { AppShell, Row } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="admin" title="מודרציה" subtitle="תוכן ומדיה.">
      <div className="space-y-2">
        <Row title="מדיה ממתינה · מפגש שרון" meta="PENDING" href="/admin/moderation" />
        <Row title="דיווח תוכן" meta="OPEN" href="/admin/moderation" />
      </div>
    </AppShell>
  );
}
