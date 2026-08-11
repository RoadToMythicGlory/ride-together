'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="rider" title="פרופיל רוכב" subtitle="הפרטים שלך בקהילה.">
      <Panel>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input className="w-full rounded-md border border-line bg-surface px-3 py-2" defaultValue="שם מלא" />
          <input className="w-full rounded-md border border-line bg-surface px-3 py-2" defaultValue="עיר" />
          <input className="w-full rounded-md border border-line bg-surface px-3 py-2" placeholder="אופנוע" />
          <PrimaryButton>שמירה</PrimaryButton>
        </form>
      </Panel>
    </AppShell>
  );
}
