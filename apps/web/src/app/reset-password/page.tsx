'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { resetPassword } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';

function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('');
    try { await resetPassword(token, password); setMessage('הסיסמה עודכנה. אפשר להתחבר.'); }
    catch (err) { setError(err instanceof Error ? err.message : 'האיפוס נכשל'); } finally { setLoading(false); }
  }
  return <main className="flex min-h-[100svh] items-center bg-bg px-6"><div className="mx-auto w-full max-w-sm">
    <Link href="/" className="text-[22px] font-extrabold">RideTogether</Link><h1 className="mt-8 text-[32px] font-extrabold">איפוס סיסמה</h1>
    {!token ? <p className="mt-4 text-danger">חסר אסימון איפוס בקישור.</p> : <form className="mt-8 space-y-4" onSubmit={submit}><Field label="סיסמה חדשה" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /><Button type="submit" disabled={loading}>{loading ? 'מעדכנים…' : 'עדכון סיסמה'}</Button></form>}
    {message ? <p className="mt-4 text-sm text-muted">{message} <Link href="/login" className="font-semibold text-accent">לכניסה</Link></p> : null}{error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
  </div></main>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="min-h-[100svh] bg-bg" />}><ResetPasswordForm /></Suspense>;
}
