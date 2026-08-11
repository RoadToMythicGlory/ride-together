'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { Button } from '@/components/ui/button';
import { MetricStage } from '@/components/manifest/metric-stage';
import { MeetupBriefBlock } from '@/components/manifest/meetup-brief';
import { RecruitMeter } from '@/components/manifest/recruit-meter';
import { DEMO_MEETUP_SHARON } from '@/content/meetups';

export default function RiderEventDetailPage() {
  return (
    <AppChrome area="rider" title="מפגש" subtitle="מה מחכה לכם — סיפורים רק אם המשפחה בחרה">
      <MetricStage
        imageSrc="/media/hero-ride.jpg"
        eyebrow="שרון · שבת 11:00"
        title={
          <>
            Community Ride
            <br />
            שרון
          </>
        }
        footer={
          <div className="space-y-3">
            <Button href="/rider/upcoming">אשר הגעה</Button>
            <Button href="/rider/events" variant="secondary">
              חזרה לרשימה
            </Button>
          </div>
        }
      >
        <div className="mb-5 flex gap-8 border-b border-line pb-5">
          <div>
            <p className="text-[36px] font-extrabold tabular-nums leading-none text-ink">9</p>
            <p className="mt-1 text-sm text-muted">ילדים מצטרפים</p>
          </div>
          <div>
            <p className="text-[36px] font-extrabold leading-none text-ink">אחרי</p>
            <p className="mt-1 text-sm text-muted">RSVP יימסר מיקום</p>
          </div>
        </div>
        <RecruitMeter value={18} max={60} />
        <MeetupBriefBlock brief={DEMO_MEETUP_SHARON} className="mt-5" />
      </MetricStage>
    </AppChrome>
  );
}
