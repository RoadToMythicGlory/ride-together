'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppChrome } from '@/components/chrome/AppChrome';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { clearSession, deleteAccount } from '@/lib/api';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const confirmation = String(form.get('confirmation') ?? '').trim();
    if (confirmation !== 'DELETE') {
      setError('יש להקליד DELETE לאישור');
      return;
    }
    setLoading(true);
    try {
      await deleteAccount(confirmation);
      clearSession();
      router.replace('/?deleted=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה במחיקה');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppChrome
      area="public"
      title="מחיקת חשבון"
      subtitle="פעולה בלתי הפיכה — נדרשת על ידי חנויות האפליקציות."
    >
      <ul className="space-y-2 text-[15px] leading-relaxed text-muted">
        <li>• הגישה לחשבון תופסק מיד</li>
        <li>• אסימוני התחברות ומכשירים יוסרו</li>
        <li>• החשבון יאונונימיזציה</li>
        <li>• נתוני ילד רגישים שלהם אתם האפוטרופוס היחיד ינוקו</li>
      </ul>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field
          label='הקלידו DELETE לאישור'
          name="confirmation"
          required
          autoComplete="off"
          placeholder="DELETE"
        />
        <Button type="submit" disabled={loading} variant="danger">
          {loading ? 'מוחקים…' : 'מחק את החשבון לצמיתות'}
        </Button>
      </form>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      <p className="mt-6">
        <Button href="/settings" variant="secondary">
          ביטול
        </Button>
      </p>
    </AppChrome>
  );
}
