'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function RoleGate({
  roles,
  permissions,
  children,
}: {
  roles?: string[];
  permissions?: string[];
  children: React.ReactNode;
}) {
  const { me, loading, hasRole, can, isSuperAdmin } = useAuth();
  const router = useRouter();

  const allowed =
    isSuperAdmin ||
    (roles?.length ? hasRole(...roles) : false) ||
    (permissions?.length ? permissions.some((p) => can(p)) : false) ||
    (!roles?.length && !permissions?.length);

  useEffect(() => {
    if (!loading && !me) router.replace('/login');
  }, [loading, me, router]);

  if (loading || !me) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-bg text-sm text-muted">
        טוען הרשאות…
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="mx-auto flex min-h-[100svh] max-w-lg flex-col justify-center px-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">אין הרשאה</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          החשבון שלכם לא כולל את התפקיד הנדרש למסך זה בארגון הפעיל.
        </p>
        <p className="mt-2 text-sm text-muted">
          ארגון: {me.activeTenant?.name ?? '—'} · תפקידים:{' '}
          {[...(me.tenantRoles ?? []), ...(me.platformRoles ?? [])].join(', ') || 'אין'}
        </p>
        <Link href="/home" className="mt-8 text-sm font-semibold text-accent">
          חזרה לפורטל
        </Link>
      </main>
    );
  }

  return <>{children}</>;
}
