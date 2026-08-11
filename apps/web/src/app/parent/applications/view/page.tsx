'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { AppChrome } from '@/components/chrome/AppChrome';
import { getApplication } from '@/lib/api';

function ParentApplicationDetail() {
  const id = useSearchParams().get('id') ?? '';
  const [app, setApp] = useState<any>();
  const [error, setError] = useState('');
  useEffect(() => {
    if (id) getApplication(id).then(setApp).catch((e) => setError(e.message));
  }, [id]);

  const shareStory = useMemo(
    () =>
      Boolean(
        app?.consents?.find((c: any) => c.consentType === 'ANONYMOUS_STORY' && c.accepted),
      ),
    [app],
  );

  return (
    <AppChrome area="parent" title="פרטי בקשה" subtitle="סטטוס והמידע שנשלח לצוות.">
      {error ? (
        <p className="text-danger">{error}</p>
      ) : !app ? (
        <p className="text-muted">טוענים…</p>
      ) : (
        <div className="space-y-4 border-t border-line pt-4">
          <p className="text-2xl font-extrabold">{app.child?.nickname}</p>
          <p className="text-sm text-muted">סטטוס: {app.status}</p>
          <p className="text-sm text-muted">גיל: {app.child?.ageYears ?? 'לא צוין'}</p>
          <p className={`text-sm font-semibold ${shareStory ? 'text-accent' : 'text-muted'}`}>
            {shareStory ? 'בחרתם: שתפו את הסיפור' : 'הסיפור נשאר אצל הצוות (לא נבחר שיתוף)'}
          </p>
          <p className="whitespace-pre-wrap text-sm">
            {app.child?.privateData?.privateStory || app.reasonSummary || 'אין פרטים נוספים.'}
          </p>
        </div>
      )}
    </AppChrome>
  );
}

export default function ParentApplicationDetailPage() {
  return <Suspense fallback={<main className="min-h-[100svh] bg-bg" />}><ParentApplicationDetail /></Suspense>;
}
