'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppShell, Panel } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { LEGAL } from '@/content/legal';
import { saveConsents } from '@/lib/api';

const items: Array<[string, string, boolean]> = [
  ['PARTICIPATION', 'השתתפות במפגש', true],
  ['PRIVACY_POLICY', 'מדיניות פרטיות (גרסה נוכחית)', true],
  ['PHOTO_INTERNAL', 'צילום לשימוש פנימי בלבד', false],
  ['VIDEO_INTERNAL', 'וידאו לשימוש פנימי בלבד', false],
  ['SOCIAL_MEDIA', 'פרסום ברשתות (אופציונלי)', false],
  ['ANONYMOUS_STORY', 'שתפו את הסיפור (אופציונלי — ברירת מחדל כבוי)', false],
  ['FUTURE_INVITATIONS', 'הזמנות עתידיות', false],
];

export default function Page() {
  const [accepted, setAccepted] = useState<Record<string, boolean>>(Object.fromEntries(items.map(([type, , checked]) => [type, checked])));
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function save() { try { await saveConsents(items.map(([consentType]) => ({ consentType, version: '2026-08-10', accepted: !!accepted[consentType] }))); setMessage('ההסכמות נשמרו.'); } catch (e) { setError(e instanceof Error ? e.message : 'השמירה נכשלה'); } }
  return (
    <AppShell
      area="parent"
      title="ניהול הסכמות"
      subtitle="כל הסכמה נפרדת. אין פרסום אוטומטי של תמונות ילדים."
    >
      <Panel>
        <p className="mb-4 text-sm text-muted">
          לפני שמירה, ודאו שקראתם את{' '}
          <Link href="/privacy" className="font-semibold text-accent">
            מדיניות הפרטיות
          </Link>{' '}
          (גרסה {LEGAL.privacyVersion}) ואת{' '}
          <Link href="/terms" className="font-semibold text-accent">
            תנאי השימוש
          </Link>
          .
        </p>
        <ul className="space-y-3">
          {items.map(([type, label]) => (
            <li key={type} className="flex items-center justify-between gap-3 text-sm">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={!!accepted[type]}
                onChange={(e) => setAccepted({ ...accepted, [type]: e.target.checked })}
              />
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Button onClick={save}>שמירת הסכמות</Button>
          {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}{error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        </div>
      </Panel>
    </AppShell>
  );
}
