'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppChrome } from '@/components/chrome/AppChrome';
import { MetricStage } from '@/components/manifest/metric-stage';
import { MeetupBriefBlock } from '@/components/manifest/meetup-brief';
import { Button } from '@/components/ui/button';
import { getEvent, rsvpEvent } from '@/lib/api';

export default function RiderEventDetailPage() {
  const { id } = useParams<{ id: string }>(); const [event, setEvent] = useState<any>(); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const load = () => getEvent(id).then(setEvent).catch((e) => setError(e.message)); useEffect(() => { load(); }, [id]);
  async function rsvp() { setLoading(true); setError(''); try { await rsvpEvent(id, 'CONFIRMED'); load(); } catch (e) { setError(e instanceof Error ? e.message : 'ההרשמה נכשלה'); } finally { setLoading(false); } }
  return <AppChrome area="rider" title="פרטי מפגש" subtitle="המידע הציבורי למשתתפים.">{error ? <p className="text-danger">{error}</p> : !event ? <p className="text-muted">טוענים…</p> : <MetricStage eyebrow={`${event.region?.nameHe ?? ''} · ${new Date(event.startsAt).toLocaleString('he-IL')}`} title={event.title} footer={<Button disabled={loading || event.myRsvp?.status === 'CONFIRMED'} onClick={rsvp}>{event.myRsvp?.status === 'CONFIRMED' ? 'ההשתתפות אושרה' : loading ? 'מאשרים…' : 'אישור השתתפות'}</Button>}><MeetupBriefBlock brief={{ summary: event.aboutText?.slice(0, 120) ?? '', about: event.aboutText ?? '', forWhom: event.audienceText ?? '', flow: event.flowSteps ?? [] }} /></MetricStage>}</AppChrome>;
}
