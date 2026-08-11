'use client';

import { AppShell, Panel } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="admin" title="הרשאות" subtitle="מטריצת RBAC">
      <Panel>
        <ul className="space-y-2 text-sm">
          <li>tenants:manage · SUPER_ADMIN</li>
          <li>applications:review · ADMIN / EVENT_MANAGER</li>
          <li>child_private:read · staff / guardian</li>
          <li>rsvp:manage_own · RIDER</li>
          <li>events:read_public · everyone in tenant</li>
        </ul>
      </Panel>
    </AppShell>
  );
}
