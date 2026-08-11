'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { forgotPassword } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ devResetToken?: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try { setResult(await forgotPassword(email)); } catch (err) { setError(err instanceof Error ? err.message : 'הבקשה נכשלה'); }
    finally { setLoading(false); }
  }

  return (
    <main className="flex min-h-[100svh] items-center bg-bg px-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-sm"
      >
        <Link href="/" className="text-[22px] font-extrabold tracking-tight">
          RideTogether
        </Link>
        <h1 className="mt-8 text-[32px] font-extrabold tracking-tight">שחזור סיסמה</h1>
        <p className="mt-2 text-sm text-muted">נשלח קישור לאיפוס למייל שלכם.</p>
        <form
          className="mt-8 space-y-4"
          onSubmit={submit}
        >
          <Field label="אימייל" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" disabled={loading}>{loading ? 'שולחים…' : 'שלחו לי קישור'}</Button>
        </form>
        {result ? <div className="mt-4 text-sm text-muted">אם החשבון קיים, נשלח קישור לאיפוס. {result.devResetToken ? <Link className="font-semibold text-accent" href={`/reset-password?token=${encodeURIComponent(result.devResetToken)}`}>קישור פיתוח לאיפוס</Link> : null}</div> : null}
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <Link href="/login" className="mt-8 inline-block text-sm font-semibold text-accent">
          חזרה לכניסה
        </Link>
      </motion.div>
    </main>
  );
}
