'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { ManifestRow } from '@/components/manifest/manifest-row';
import { MetricStage } from '@/components/manifest/metric-stage';
import { RecruitMeter } from '@/components/manifest/recruit-meter';
import { Button } from '@/components/ui/button';

export default function ManagerHomePage() {
  return (
    <AppChrome area="manager" title="תפעול" subtitle="מה שדורש תשומת לב היום.">
      <MetricStage
        imageSrc="/media/community-ride.jpg"
        eyebrow="מפגש שרון · שבת"
        title={
          <>
            גיוס רוכבים
            <br />
            למפגש הקרוב
          </>
        }
        footer={<Button href="/manager/notifications">שלח גיוס לאזור</Button>}
      >
        <div className="mb-5 grid grid-cols-2 gap-0 divide-x divide-x-reverse divide-line">
          <div className="pr-4">
            <p className="text-[40px] font-extrabold leading-none tracking-tight tabular-nums text-ink">
              7
            </p>
            <p className="mt-2 text-sm leading-snug text-muted">בקשות ממתינות</p>
          </div>
          <div className="pl-4">
            <p className="text-[40px] font-extrabold leading-none tracking-tight tabular-nums text-ink">
              12
            </p>
            <p className="mt-2 text-sm leading-snug text-muted">מאושרים להמתנה</p>
          </div>
        </div>
        <RecruitMeter value={18} max={60} />
      </MetricStage>

      <section className="mt-10">
        <p className="mb-2 text-sm font-medium text-muted">תור עבודה</p>
        <ManifestRow index={0} title="בקשות ממתינות" meta="7 בתור" href="/manager/applications" />
        <ManifestRow
          index={1}
          title="שיבוץ ילדים"
          meta="12 מוכנים"
          href="/manager/events/demo/assign"
        />
        <ManifestRow
          index={2}
          title="גיוס רוכבים"
          meta="חסרים 42 ליעד"
          href="/manager/notifications"
        />
        <ManifestRow
          index={3}
          title="תפעול מפגש"
          href="/manager/events/demo/ops"
          accent="ink"
        />
        <ManifestRow index={4} title="יצירת מפגש" href="/manager/events/new" accent="muted" />
      </section>
    </AppChrome>
  );
}
