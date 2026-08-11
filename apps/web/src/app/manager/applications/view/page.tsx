'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { AppChrome } from '@/components/chrome/AppChrome';
import { Button } from '@/components/ui/button';
import { assignApplication, getApplication, listEvents, transitionApplication } from '@/lib/api';

function ManagerApplicationDetail() {
  const id = useSearchParams().get('id') ?? '';
  const [app, setApp] = useState<any>();
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => getApplication(id).then(setApp).catch((e) => setError(e.message));
  useEffect(() => {
    if (!id) return;
    load();
    listEvents()
      .then((x) => setEvents(x.filter((e: any) => e.status === 'OPEN_FOR_RIDERS')))
      .catch((e) => setError(e.message));
  }, [id]);

  const shareStory = useMemo(
    () =>
      Boolean(
        app?.consents?.find((c: any) => c.consentType === 'ANONYMOUS_STORY' && c.accepted),
      ),
    [app],
  );

  async function action(task: () => Promise<unknown>) {
    setLoading(true);
    setError('');
    try {
      await task();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'הפעולה נכשלה');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppChrome area="manager" title="סקירת בקשה" subtitle="החלטה ושיבוץ מבוקרים.">
      {error ? <p className="mb-4 text-danger">{error}</p> : null}
      {!app ? (
        <p className="text-muted">טוענים…</p>
      ) : (
        <>
          <h2 className="text-2xl font-extrabold">{app.child?.nickname}</h2>
          <p className="mt-2 text-sm text-muted">סטטוס: {app.status}</p>
          <p
            className={`mt-3 text-sm font-semibold ${shareStory ? 'text-accent' : 'text-muted'}`}
          >
            {shareStory
              ? 'המשפחה ביקשה: שתפו את הסיפור'
              : 'הסיפור לצוות בלבד (לא נבחר שיתוף)'}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm">
            {app.child?.privateData?.privateStory || app.reasonSummary || 'אין סיפור נוסף.'}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Button disabled={loading} onClick={() => action(() => transitionApplication(id, 'APPROVED'))}>
              אישור
            </Button>
            <Button
              variant="secondary"
              disabled={loading}
              onClick={() => action(() => transitionApplication(id, 'UNDER_REVIEW'))}
            >
              בבדיקה
            </Button>
            <Button
              variant="danger"
              disabled={loading}
              onClick={() => action(() => transitionApplication(id, 'REJECTED'))}
            >
              דחייה
            </Button>
          </div>
          {events[0] ? (
            <Button
              className="mt-4"
              variant="secondary"
              disabled={loading}
              onClick={() => action(() => assignApplication(id, events[0].id))}
            >
              שיבוץ למפגש הפתוח: {events[0].title}
            </Button>
          ) : (
            <p className="mt-4 text-sm text-muted">אין כרגע מפגש פתוח לשיבוץ.</p>
          )}
        </>
      )}
    </AppChrome>
  );
}

export default function ManagerApplicationDetailPage() {
  return <Suspense fallback={<main className="min-h-[100svh] bg-bg" />}><ManagerApplicationDetail /></Suspense>;
}
