'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="admin" title="הגדרות מערכת" subtitle="Tenant + platform settings">
      <Panel>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input className="w-full rounded-md border border-line bg-surface px-3 py-2" defaultValue="RideTogether" />
          <input className="w-full rounded-md border border-line bg-surface px-3 py-2" defaultValue="ride-together" />
          <PrimaryButton>שמירה</PrimaryButton>
        </form>
      </Panel>
    </AppShell>
  );
}
