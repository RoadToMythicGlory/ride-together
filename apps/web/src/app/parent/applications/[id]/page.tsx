'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AppChrome } from '@/components/chrome/AppChrome';
import { getApplication } from '@/lib/api';

export default function ParentApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<any>();
  const [error, setError] = useState('');
  useEffect(() => {
    getApplication(id).then(setApp).catch((e) => setError(e.message));
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
