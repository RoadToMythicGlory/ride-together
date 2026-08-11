'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { LEGAL } from '@/content/legal';
import { register, saveSession } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const capabilities: Array<'RIDER' | 'PARENT'> = [];
    if (form.get('rider')) capabilities.push('RIDER');
    if (form.get('parent')) capabilities.push('PARENT');
    if (capabilities.length === 0) {
      setError('בחרו לפחות תפקיד אחד');
      setLoading(false);
      return;
    }
    if (!form.get('age18') || !form.get('terms') || !form.get('privacy')) {
      setError('יש לאשר גיל 18+, תנאי שימוש ומדיניות פרטיות');
      setLoading(false);
      return;
    }
    try {
      const data = await register({
        email: String(form.get('email')),
        password: String(form.get('password')),
        fullName: String(form.get('fullName')),
        capabilities,
        ageAttested18: true,
        acceptedTerms: true,
        acceptedPrivacy: true,
      });
      saveSession(data);
      router.replace('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[100svh] items-center bg-bg px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-sm"
      >
        <Link href="/" className="text-[22px] font-extrabold tracking-tight text-ink">
          RideTogether
        </Link>
        <h1 className="mt-8 text-[32px] font-extrabold tracking-tight text-ink">הצטרפות</h1>
        <p className="mt-2 text-sm text-muted">
          למבוגרים בלבד ({LEGAL.minAge}+).
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="שם מלא" name="fullName" required />
          <Field label="אימייל" name="email" type="email" required autoComplete="email" />
          <Field
            label="סיסמה"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />

          <fieldset className="space-y-3 border-t border-line pt-4">
            <legend className="text-sm font-medium text-muted">מי אני?</legend>
            <label className="flex items-center justify-between py-1 text-[15px] font-medium">
              <span>רוכב/ת</span>
              <input name="rider" type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--accent)]" />
            </label>
            <label className="flex items-center justify-between py-1 text-[15px] font-medium">
              <span>הורה / אפוטרופוס</span>
              <input name="parent" type="checkbox" className="h-4 w-4 accent-[var(--accent)]" />
            </label>
          </fieldset>

          <fieldset className="space-y-3 border-t border-line pt-4">
            <legend className="text-sm font-medium text-muted">אישורים נדרשים</legend>
            <label className="flex items-start gap-3 py-1 text-[14px] leading-snug">
              <input name="age18" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]" />
              <span>אני מאשר/ת שאני בן/בת {LEGAL.minAge} ומעלה</span>
            </label>
            <label className="flex items-start gap-3 py-1 text-[14px] leading-snug">
              <input name="terms" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]" />
              <span>
                קראתי ואני מסכים/ה ל
                <Link href="/terms" className="mx-1 font-semibold text-accent" target="_blank">
                  תנאי השימוש
                </Link>
              </span>
            </label>
            <label className="flex items-start gap-3 py-1 text-[14px] leading-snug">
              <input name="privacy" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]" />
              <span>
                קראתי ואני מסכים/ה ל
                <Link href="/privacy" className="mx-1 font-semibold text-accent" target="_blank">
                  מדיניות הפרטיות
                </Link>
              </span>
            </label>
          </fieldset>

          <Button type="submit" disabled={loading}>
            {loading ? 'יוצרים…' : 'יצירת חשבון'}
          </Button>
        </form>

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

        <p className="mt-8 text-sm text-muted">
          כבר יש חשבון?{' '}
          <Link href="/login" className="font-semibold text-accent">
            כניסה
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
