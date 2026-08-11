'use client';

import { AppShell, Panel } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="admin" title="אנליטיקה" subtitle="מדדים תפעוליים">
      <div className="grid grid-cols-2 gap-2">
        <Panel><p className="text-2xl font-bold">128</p><p className="text-xs">רוכבים פעילים</p></Panel>
        <Panel><p className="text-2xl font-bold">34</p><p className="text-xs">בקשות החודש</p></Panel>
        <Panel><p className="text-2xl font-bold">6</p><p className="text-xs">מפגשים פתוחים</p></Panel>
        <Panel><p className="text-2xl font-bold">71%</p><p className="text-xs">אישור השתתפות הורים</p></Panel>
      </div>
    </AppShell>
  );
}
