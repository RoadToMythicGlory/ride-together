'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { Button } from '@/components/ui/button';
import { ManifestRow } from '@/components/manifest/manifest-row';
import { MetricStage } from '@/components/manifest/metric-stage';
import { StatusRunway } from '@/components/manifest/status-runway';

const STEPS = [
  { id: 'received', label: 'התקבלה' },
  { id: 'review', label: 'בבדיקה' },
  { id: 'approved', label: 'אושרה' },
  { id: 'assigned', label: 'שובצה' },
];

export default function ParentHomePage() {
  return (
    <AppChrome
      area="parent"
      title="שלום,"
      subtitle="מעקב ברור — בלי רעש, בלי לחץ מיותר."
    >
      <MetricStage
        imageSrc="/media/community-ride.jpg"
        eyebrow="בקשה עבור נועם"
        title={
          <>
            הצוות עובר
            <br />
            על הפרטים
          </>
        }
        footer={<Button href="/parent/applications/demo">מעקב מלא</Button>}
      >
        <StatusRunway steps={STEPS} activeIndex={1} />
        <p className="mt-5 text-sm leading-relaxed text-muted">
          נעדכן ברגע שיש התקדמות, או אם נדרש מכם מידע נוסף.
        </p>
      </MetricStage>

      <section className="mt-10">
        <p className="mb-2 text-sm font-medium text-muted">פעולות</p>
        <ManifestRow index={0} title="הגשת בקשה חדשה" href="/parent/applications/new" />
        <ManifestRow index={1} title="כל הבקשות" href="/parent/applications" />
        <ManifestRow
          index={2}
          title="מפגש ששובץ"
          meta="יופיע כאן אחרי שיבוץ"
          href="/parent/event"
        />
        <ManifestRow
          index={3}
          title="ניהול הסכמות"
          href="/parent/consents"
          accent="ink"
        />
      </section>
    </AppChrome>
  );
}
