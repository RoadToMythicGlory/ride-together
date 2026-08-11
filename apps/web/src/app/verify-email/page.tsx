'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { verifyEmail } from '@/lib/api';

function VerifyEmailContent() {
  const token = useSearchParams().get('token') ?? '';
  const [state, setState] = useState('מאמתים את כתובת האימייל…');
  useEffect(() => {
    if (!token) { setState('חסר אסימון אימות בקישור.'); return; }
    verifyEmail(token).then(() => setState('כתובת האימייל אומתה בהצלחה.')).catch((e) => setState(e instanceof Error ? e.message : 'האימות נכשל.'));
  }, [token]);
  return <main className="flex min-h-[100svh] items-center bg-bg px-6"><div className="mx-auto w-full max-w-sm"><Link href="/" className="text-[22px] font-extrabold">RideTogether</Link><h1 className="mt-8 text-[32px] font-extrabold">אימות אימייל</h1><p className="mt-4 text-muted">{state}</p><Link href="/login" className="mt-8 inline-block text-sm font-semibold text-accent">לכניסה</Link></div></main>;
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<main className="min-h-[100svh] bg-bg" />}><VerifyEmailContent /></Suspense>;
}
