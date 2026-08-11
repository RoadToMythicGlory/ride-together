'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="manager" title="התראות וגיוס" subtitle="קמפיין ממוקד אזור, עם rate limit.">
      <Panel>
        <p className="text-sm text-muted">״אנחנו צריכים עוד 25 רוכבים למפגש בשרון ביום שבת.״</p>
        <div className="mt-3 space-y-2 text-sm">
          <label className="flex justify-between"><span>שרון</span><input type="checkbox" defaultChecked /></label>
          <label className="flex justify-between"><span>הרצליה</span><input type="checkbox" defaultChecked /></label>
          <label className="flex justify-between"><span>תל אביב</span><input type="checkbox" /></label>
        </div>
        <div className="mt-4"><PrimaryButton>שליחת קמפיין</PrimaryButton></div>
      </Panel>
    </AppShell>
  );
}
