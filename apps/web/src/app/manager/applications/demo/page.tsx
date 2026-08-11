'use client';

import { AppShell, GhostButton, Panel, PrimaryButton, StatusPill } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="manager" title="סקירת בקשה" subtitle="פרטים רגישים לצוות בלבד.">
      <Panel>
        <StatusPill>UNDER_REVIEW</StatusPill>
        <p className="mt-3 text-sm">כינוי: נועם · גיל 9 · שרון</p>
        <p className="mt-2 rounded-xl bg-bg p-3 text-sm text-asphalt/80">
          סיפור פרטי / הקשר לתמיכה מוצג כאן לצוות. אם ההורה סימן ״שתפו את הסיפור״ — אפשר לתאם פרסום מכבד.
        </p>
      </Panel>
      <div className="mt-4 space-y-3">
        <PrimaryButton href="/manager/waiting">אישור</PrimaryButton>
        <GhostButton href="/manager/applications">בקשת מידע נוסף</GhostButton>
        <GhostButton href="/manager/applications">דחייה</GhostButton>
      </div>
    </AppShell>
  );
}
