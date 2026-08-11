'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="manager" title="שיבוץ ילדים" subtitle="Assignment + Participation lifecycle.">
      <Panel title="מועמדים מאושרים">
        <label className="mb-2 flex items-center justify-between text-sm"><span>נועם · גיל 9</span><input type="checkbox" defaultChecked /></label>
        <label className="mb-2 flex items-center justify-between text-sm"><span>מאיה · גיל 10</span><input type="checkbox" defaultChecked /></label>
        <label className="flex items-center justify-between text-sm"><span>יואב · גיל 8</span><input type="checkbox" /></label>
      </Panel>
      <div className="mt-4"><PrimaryButton href="/manager/events/demo/ops">שיבוץ למפגש</PrimaryButton></div>
    </AppShell>
  );
}
