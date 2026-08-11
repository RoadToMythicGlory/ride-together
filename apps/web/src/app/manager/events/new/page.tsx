'use client';

import { AppShell, Panel } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { createEvent, listRegions, setEventStatus } from '@/lib/api';

export default function Page() {
  const [regions, setRegions] = useState<any[]>([]); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  useEffect(() => { listRegions().then(setRegions).catch((e) => setError(e.message)); }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const data = new FormData(e.currentTarget); setError('');
    try { const event = await createEvent({ title: data.get('title'), regionId: data.get('regionId'), startsAt: new Date(String(data.get('startsAt'))).toISOString(), riderTarget: Number(data.get('riderTarget')), childCapacity: Number(data.get('childCapacity')), aboutText: data.get('aboutText'), audienceText: data.get('audienceText'), flowSteps: String(data.get('flowSteps')).split('\n').filter(Boolean) }); await setEventStatus(event.id, 'OPEN_FOR_RIDERS'); setMessage('המפגש נוצר ונפתח לרוכבים.'); } catch (err) { setError(err instanceof Error ? err.message : 'יצירת המפגש נכשלה'); }
  }
  return (
    <AppShell area="manager" title="יצירת מפגש" subtitle="תארו מה המפגש ומי אמור להגיע — בלי סיפורים אישיים אלא אם משפחה בחרה לשתף.">
      <Panel>
        <form className="space-y-3" onSubmit={submit}>
          <input
            className="w-full rounded-md border border-line bg-surface px-3 py-2"
            placeholder="כותרת"
            defaultValue="Community Ride · שרון"
            name="title"
          />
          <select name="regionId" required className="w-full rounded-md border border-line bg-surface px-3 py-2"><option value="">בחירת אזור</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.nameHe}</option>)}</select>
          <input name="startsAt" required className="w-full rounded-md border border-line bg-surface px-3 py-2" type="datetime-local" />
          <input
            className="w-full rounded-md border border-line bg-surface px-3 py-2"
            placeholder="יעד רוכבים"
            type="number"
            defaultValue={60}
            name="riderTarget"
          />
          <input
            className="w-full rounded-md border border-line bg-surface px-3 py-2"
            placeholder="קיבולת ילדים"
            type="number"
            defaultValue={12}
            name="childCapacity"
          />

          <div className="border-t border-line pt-3">
            <p className="text-xs font-semibold text-muted">מידע למשתתפים</p>
            <p className="mt-1 text-xs text-muted">
              כדי שאנשים יידעו למה הם מגיעים. סיפורי רקע על ילדים — רק אם המשפחה בחרה לשתף.
            </p>
          </div>

          <textarea
            className="min-h-[88px] w-full rounded-md border border-line bg-surface px-3 py-2"
            placeholder="על המפגש — מה קורה שם בפועל"
            defaultValue="מפגש קהילתי קצר באזור: רוכבים מגיעים לתמוך במשפחות ששובצו מראש. התכנסות, תדריך בטיחות, רכיבה קבוצתית קצרה וסיום מסודר."
            name="aboutText"
          />
          <textarea
            className="min-h-[72px] w-full rounded-md border border-line bg-surface px-3 py-2"
            placeholder="למי זה מיועד"
            defaultValue="לרוכבים מורשים; להורים/אפוטרופוסים ששובצו; לילדים שמגיעים רק עם מבוגר אחראי. סיפורים אישיים לא מפורסמים אלא אם המשפחה בחרה."
            name="audienceText"
          />
          <textarea
            className="min-h-[88px] w-full rounded-md border border-line bg-surface px-3 py-2"
            placeholder="מה קורה במפגש (שורה לכל שלב)"
            defaultValue={
              'התכנסות בנקודה שתימסר אחרי אישור\nתדריך בטיחות קצר\nרכיבה קבוצתית קצרה\nסיום והתפזרות'
            }
            name="flowSteps"
          />

          <Button type="submit">יצירה ופתיחה לרוכבים</Button>
          {message ? <p className="text-sm text-muted">{message}</p> : null}{error ? <p className="text-sm text-danger">{error}</p> : null}
        </form>
      </Panel>
    </AppShell>
  );
}
