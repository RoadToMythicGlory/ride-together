'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { Button } from '@/components/ui/button';
import { ManifestRow } from '@/components/manifest/manifest-row';
import { MetricStage } from '@/components/manifest/metric-stage';
import { RecruitMeter } from '@/components/manifest/recruit-meter';
import { DEMO_MEETUP_SHARON } from '@/content/meetups';

export default function RiderHomePage() {
  return (
    <AppChrome area="rider" title="היי," subtitle="הקהילה זקוקה לנוכחות שלך השבת.">
      <MetricStage
        imageSrc="/media/hero-ride.jpg"
        eyebrow="שרון · שבת 11:00"
        title={
          <>
            Community Ride
            <br />
            מחכים לרוכבים
          </>
        }
        footer={<Button href="/rider/events/demo">לפרטים ו־RSVP</Button>}
      >
        <RecruitMeter value={18} max={60} />
        <p className="mt-4 text-[15px] leading-relaxed text-ink">{DEMO_MEETUP_SHARON.summary}</p>
        <p className="mt-2 text-sm text-muted">9 ילדים מצטרפים · סיפורים רק אם המשפחה בחרה לשתף</p>
      </MetricStage>

      <section className="mt-10">
        <p className="mb-2 text-sm font-medium text-muted">המשך</p>
        <ManifestRow
          index={0}
          title="מפגשים באזור"
          meta="לפי העדפות ההתראה שלך"
          href="/rider/events"
        />
        <ManifestRow
          index={1}
          title="המפגשים שלי"
          meta="אישורים והמתנה"
          href="/rider/upcoming"
        />
        <ManifestRow
          index={2}
          title="העדפות התראות"
          meta="ערים ואזורים"
          href="/rider/notifications"
          accent="ink"
        />
      </section>
    </AppChrome>
  );
}
