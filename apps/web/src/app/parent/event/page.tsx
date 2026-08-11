'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { Button } from '@/components/ui/button';
import { MetricStage } from '@/components/manifest/metric-stage';
import { MeetupBriefBlock } from '@/components/manifest/meetup-brief';
import { StatusRunway } from '@/components/manifest/status-runway';
import { useEffect, useState } from 'react';
import { listMyParticipations } from '@/lib/api';

const STEPS = [
  { id: 'a', label: 'שובץ' },
  { id: 'b', label: 'הוזמן' },
  { id: 'c', label: 'אישור' },
  { id: 'd', label: 'הגעה' },
];

export default function ParentEventPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { listMyParticipations().then(setItems).catch((e) => setError(e.message)); }, []);
  const participation = items[0];
  const event = participation?.assignment?.event;
  return (
    <AppChrome area="parent" title="מפגש ששובץ" subtitle="מה מחכה לכם במפגש">
      {error ? <p className="text-danger">{error}</p> : !participation ? <p className="text-muted">אין מפגש ששובצתם אליו כרגע.</p> : <MetricStage
        imageSrc="/media/community-ride.jpg"
        eyebrow={`${event.region?.nameHe ?? ''} · ${new Date(event.startsAt).toLocaleString('he-IL')}`}
        title={
          <>
            {event.title}
            <br />
            מחכה לאישור שלכם
          </>
        }
        footer={<Button href={`/parent/confirm?id=${participation.id}`}>אישור / דחיית השתתפות</Button>}
      >
        <StatusRunway steps={STEPS} activeIndex={1} />
        <p className="mt-5 text-sm text-muted">
          פרטי הגעה יימסרו לפני המפגש — לא כתובת מגורים.
        </p>
        <MeetupBriefBlock brief={{ summary: event.aboutText?.slice(0, 120) ?? '', about: event.aboutText ?? '', forWhom: event.audienceText ?? '', flow: event.flowSteps ?? [] }} className="mt-5" />
      </MetricStage>}
    </AppChrome>
  );
}
