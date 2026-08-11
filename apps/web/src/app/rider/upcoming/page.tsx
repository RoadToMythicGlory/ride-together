'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { EventPoster } from '@/components/manifest/event-poster';
import { useEffect, useState } from 'react';
import { listMyRsvps } from '@/lib/api';

export default function RiderUpcomingPage() {
  const [rsvps, setRsvps] = useState<any[]>([]); const [error, setError] = useState('');
  useEffect(() => { listMyRsvps().then(setRsvps).catch((e) => setError(e.message)); }, []);
  return (
    <AppChrome area="rider" title="המפגשים שלי" subtitle="מה שכבר על המסלול.">
      {error ? <p className="text-sm text-danger">{error}</p> : null}{!error && !rsvps.length ? <p className="text-sm text-muted">אין מפגשים שמורים.</p> : null}
      <div className="space-y-4">{rsvps.map((rsvp, i) => { const event = rsvp.event; return <EventPoster key={rsvp.id} index={i} href={`/rider/events/view?id=${event.id}`} title={event.title} region={event.region?.nameHe ?? ''} when={`${rsvp.status} · ${new Date(event.startsAt).toLocaleString('he-IL')}`} childrenCount={event.childCapacity ?? 0} riders={0} riderTarget={event.riderTarget ?? 0} summary={event.aboutText?.slice(0, 120)} />; })}</div>
    </AppChrome>
  );
}
