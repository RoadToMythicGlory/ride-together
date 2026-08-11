'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { EventPoster } from '@/components/manifest/event-poster';
import { useEffect, useState } from 'react';
import { listEvents } from '@/lib/api';

export default function RiderEventsPage() {
  const [events, setEvents] = useState<any[]>([]); const [error, setError] = useState('');
  useEffect(() => { listEvents().then(setEvents).catch((e) => setError(e.message)); }, []);
  return (
    <AppChrome area="rider" title="באזור שלך" subtitle="מפגשים פתוחים — בלי פרטי ילדים.">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted">מפגשים פתוחים</p>
        <span className="text-sm tabular-nums text-muted">{events.length}</span>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {!error && !events.length ? <p className="text-sm text-muted">אין מפגשים פתוחים כרגע.</p> : null}
      <div className="space-y-4">
        {events.map((event, i) => <EventPoster key={event.id} index={i} href={`/rider/events/view?id=${event.id}`} title={event.title} region={event.region?.nameHe ?? 'אזור לא צוין'} when={new Date(event.startsAt).toLocaleString('he-IL')} childrenCount={event.childrenCount ?? 0} riders={event.ridersCount ?? 0} riderTarget={event.riderTarget ?? 0} summary={event.aboutText?.slice(0, 120)} />)}
      </div>
    </AppChrome>
  );
}
