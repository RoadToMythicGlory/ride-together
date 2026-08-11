'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { Button } from '@/components/ui/button';
import { MetricStage } from '@/components/manifest/metric-stage';
import { StatusRunway } from '@/components/manifest/status-runway';

const STEPS = [
  { id: '1', label: 'התקבלה' },
  { id: '2', label: 'בבדיקה' },
  { id: '3', label: 'אושרה' },
  { id: '4', label: 'שובצה' },
];

export default function ApplicationStatusPage() {
  return (
    <AppChrome area="parent" title="סטטוס בקשה" subtitle="עבור הכינוי שנבחר בבקשה">
      <MetricStage
        imageSrc="/media/community-ride.jpg"
        eyebrow="סטטוס נוכחי"
        title={
          <>
            הבקשה בבדיקה
            <br />
            אצל הצוות
          </>
        }
      >
        <StatusRunway steps={STEPS} activeIndex={1} />
      </MetricStage>
      <div className="mt-8 space-y-3 px-1">
        <Button href="/parent/applications/demo/more-info">השלמת מידע</Button>
        <Button href="/parent/applications" variant="secondary">
          כל הבקשות
        </Button>
      </div>
    </AppChrome>
  );
}
