'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="parent" title="השלמת מידע" subtitle="הצוות ביקש פרטים נוספים.">
      <Panel>
        <textarea className="min-h-36 w-full rounded-md border border-line bg-surface px-3 py-2" placeholder="התשובה שלכם לצוות" />
        <div className="mt-3"><PrimaryButton href="/parent/applications/demo">שליחה</PrimaryButton></div>
      </Panel>
    </AppShell>
  );
}
