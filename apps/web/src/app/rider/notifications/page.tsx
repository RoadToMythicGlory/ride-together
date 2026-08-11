'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="rider" title="העדפות התראות" subtitle="עיר או אזור — בלי הרחבה אוטומטית.">
      <Panel title="מנויים נוכחיים">
        <ul className="space-y-2 text-sm">
          <li className="rounded-xl bg-bg px-3 py-2">עיר · הרצליה</li>
          <li className="rounded-xl bg-bg px-3 py-2">עיר · רמת השרון</li>
          <li className="rounded-xl bg-bg px-3 py-2">אזור · תל אביב</li>
        </ul>
      </Panel>
      <div className="mt-4"><PrimaryButton href="/rider">שמירת העדפות</PrimaryButton></div>
    </AppShell>
  );
}
