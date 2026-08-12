'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { GoogleButton } from '@/components/ui/google-button';
import { googleLogin, login, saveSession } from '@/lib/api';
import { isGoogleLoginEnabled } from '@/lib/google-auth';

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function goNext() {
    const next = search.get('next');
    router.replace(next && next.startsWith('/') ? next : '/home');
  }

  async function onGoogleCredential(idToken: string) {
    setError(null);
    try {
      const data = await googleLogin({ idToken });
      if (data?.needsRegistration) {
        sessionStorage.setItem(
          'rt_google_signup',
          JSON.stringify({
            idToken,
            email: data.email ?? '',
            fullName: data.fullName ?? '',
          }),
        );
        router.push('/register?google=1');
        return;
      }
      saveSession(data);
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהתחברות עם Google');
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const data = await login(
        String(form.get('email')),
        String(form.get('password')),
      );
      saveSession(data);
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[100svh] items-center bg-bg px-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-sm"
      >
        <Link href="/" className="text-[22px] font-extrabold tracking-tight text-ink">
          RideTogether
        </Link>
        <h1 className="mt-8 text-[32px] font-extrabold tracking-tight text-ink">כניסה</h1>
        <p className="mt-2 text-sm text-muted">ברוכים השבים לקהילה.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field
            label="אימייל"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Field
            label="סיסמה"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'מתחבר…' : 'המשך'}
          </Button>
        </form>

        {isGoogleLoginEnabled() ? (
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs font-medium text-muted">או</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="mt-4">
              <GoogleButton onCredential={onGoogleCredential} onError={setError} />
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

        <div className="mt-8 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="font-medium text-muted">
            שחזור סיסמה
          </Link>
          <Link href="/register" className="font-semibold text-accent">
            הרשמה
          </Link>
        </div>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-[100svh] items-center justify-center bg-bg text-sm text-muted">טוען…</main>}>
      <LoginForm />
    </Suspense>
  );
}
