'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createApplication } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Field, TextArea } from '@/components/ui/field';

export default function NewApplicationPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareStory, setShareStory] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const data = new FormData(e.currentTarget);
    try {
      await createApplication({
        nickname: data.get('nickname'),
        ageYears: Number(data.get('ageYears')),
        privateStory: data.get('privateStory'),
        reasonSummary: data.get('reasonSummary'),
        acceptParticipation: data.get('acceptParticipation') === 'on',
        acceptPrivacy: data.get('acceptPrivacy') === 'on',
        shareStory,
      });
      router.push('/parent/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שליחת הבקשה נכשלה');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppChrome
      area="parent"
      title="הגשת בקשה"
      subtitle="הילדים אינם מקבלים חשבון במערכת."
    >
      <form className="space-y-4" onSubmit={submit}>
        <Field name="nickname" label="שם הילד" placeholder="שם" required />
        <Field name="ageYears" label="גיל" type="number" min="1" required />
        <TextArea name="reasonSummary" label="סיבת הבקשה" placeholder="סיכום קצר לצוות" />
        <TextArea
          name="privateStory"
          label="הקשר / הסיפור"
          placeholder="אפשר לכתוב בחופשיות — ברירת המחדל היא לצוות בלבד"
        />

        <div className="space-y-2 border border-line bg-surface p-4">
          <p className="text-sm font-semibold text-ink">שיתוף הסיפור</p>
          <p className="text-[13px] leading-relaxed text-muted">
            כברירת מחדל אנחנו לא מפרסמים סיפורים אישיים. אם תרצו — אפשר לבחור שנשתף את הסיפור
            בכבוד, בתיאום איתכם.
          </p>
          <button
            type="button"
            role="switch"
            aria-checked={shareStory}
            onClick={() => setShareStory((v) => !v)}
            className={`mt-1 w-full border px-4 py-3 text-start text-sm font-extrabold transition ${
              shareStory
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-line bg-bg text-ink hover:border-ink/25'
            }`}
          >
            שתפו את הסיפור
            <span className="mt-1 block text-[12px] font-medium text-muted">
              {shareStory ? 'מסומן — נאפשר שיתוף מכבד בהסכמתכם' : 'לא מסומן — הסיפור נשאר אצל הצוות'}
            </span>
          </button>
        </div>

        <label className="flex items-start gap-3 py-2 text-sm text-muted">
          <input
            name="acceptParticipation"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 accent-[var(--accent)]"
          />
          אני מאשר/ת השתתפות
        </label>
        <label className="flex items-start gap-3 py-2 text-sm text-muted">
          <input
            name="acceptPrivacy"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 accent-[var(--accent)]"
          />
          אני מאשר/ת את מדיניות הפרטיות
        </label>
        <Button type="submit" disabled={loading}>
          {loading ? 'שולחים…' : 'שליחת בקשה'}
        </Button>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </form>
    </AppChrome>
  );
}
