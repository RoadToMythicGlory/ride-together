'use client';

import { AppShell, Panel } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { respondParticipation } from '@/lib/api';

function ConfirmContent() {
  const id = useSearchParams().get('id') ?? '';
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function respond(status: string) { if (!id) return setError('חסר מזהה השתתפות.'); try { await respondParticipation(id, status); setMessage(status === 'PARENT_CONFIRMED' ? 'ההגעה אושרה.' : 'ההשתתפות נדחתה.'); } catch (e) { setError(e instanceof Error ? e.message : 'הפעולה נכשלה'); } }
  return (
    <AppShell area="parent" title="אישור השתתפות" subtitle="אשרו הגעה למפגש ששובץ.">
      <Panel>
        <p className="text-sm text-muted">מפגש שרון · שבת 11:00 · עבור הכינוי שנבחר בבקשה.</p>
      </Panel>
      <div className="mt-4 space-y-3">
        <Button onClick={() => respond('PARENT_CONFIRMED')}>מאשרים הגעה</Button>
        <Button variant="secondary" onClick={() => respond('PARENT_DECLINED')}>לא נוכל הפעם</Button>
        {message ? <p className="text-sm text-muted">{message}</p> : null}{error ? <p className="text-sm text-danger">{error}</p> : null}
      </div>
    </AppShell>
  );
}

export default function Page() {
  return <Suspense fallback={<main className="min-h-[100svh] bg-bg" />}><ConfirmContent /></Suspense>;
}
