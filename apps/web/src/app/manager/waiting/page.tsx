'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { MetricStage } from '@/components/manifest/metric-stage';
import { ManifestRow } from '@/components/manifest/manifest-row';
import { Button } from '@/components/ui/button';

export default function ManagerWaitingPage() {
  return (
    <AppChrome area="manager" title="ממתינים לשיבוץ" subtitle="מאושרים — מוכנים למפגש.">
      <MetricStage
        imageSrc="/media/community-ride.jpg"
        eyebrow="רשימת המתנה"
        title={
          <>
            12 ילדים
            <br />
            מוכנים לשיבוץ
          </>
        }
        footer={<Button href="/manager/events/demo/assign">פתח שיבוץ</Button>}
      >
        <p className="text-sm text-muted">
          שיבוץ למפגש קיים משמר פרטיות — בלי חשיפה לרוכבים.
        </p>
      </MetricStage>

      <section className="mt-10">
        <ManifestRow index={0} title="כינוי · שרון · טווח 8–10" meta="מאושר · בלי שם מלא" href="/manager/events/demo/assign" />
        <ManifestRow
          index={1}
          title="כינוי · מרכז · טווח 10–12"
          meta="מאושר · בלי שם מלא"
          href="/manager/events/demo/assign"
          accent="ink"
        />
        <ManifestRow
          index={2}
          title="כינוי · ת״א · טווח 7–9"
          meta="מאושר · בלי שם מלא"
          href="/manager/events/demo/assign"
          accent="muted"
        />
      </section>
    </AppChrome>
  );
}
