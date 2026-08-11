'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BrandMark } from '@/components/brand/BrandMark';
import { clearSession, getMe, type MeResponse } from '@/lib/api';
const PORTALS = [
  {
    href: '/rider',
    label: 'רוכב',
    desc: 'מפגשים חיים באזור שלך',
    tone: 'from-[#00a3a3] to-[#0b1220]',
    stat: '18/60',
    statLabel: 'גיוס לשבת',
    roles: ['RIDER', 'ADMIN', 'EVENT_MANAGER', 'SUPER_ADMIN'],
  },
  {
    href: '/parent',
    label: 'הורה',
    desc: 'בקשות ושיבוץ שקט',
    tone: 'from-[#1b2a4a] to-[#0b1220]',
    stat: 'LIVE',
    statLabel: 'סטטוס בקשה',
    roles: ['PARENT', 'ADMIN', 'SUPER_ADMIN'],
  },
  {
    href: '/manager',
    label: 'מארגן',
    desc: 'תור, שיבוץ, גיוס',
    tone: 'from-[#12353a] to-[#0b1220]',
    stat: '7',
    statLabel: 'בקשות בתור',
    roles: ['EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  },
  {
    href: '/admin',
    label: 'מערכת',
    desc: 'שליטה על הפלטפורמה',
    tone: 'from-[#2a2038] to-[#0b1220]',
    stat: '99.9',
    statLabel: 'uptime',
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
] as const;

function greetingName(fullName: string) {
  if (/platform|admin|משתמש/i.test(fullName)) return null;
  return fullName.trim().split(/\s+/)[0] || null;
}

function roleLabel(me: MeResponse) {
  if (me.platformRoles.includes('SUPER_ADMIN')) return 'ניהול פלטפורמה';
  if (me.tenantRoles.includes('ADMIN')) return 'ניהול ארגון';
  if (me.tenantRoles.includes('EVENT_MANAGER')) return 'מארגן קהילה';
  if (me.tenantRoles.includes('RIDER') && me.tenantRoles.includes('PARENT')) {
    return 'רוכב · הורה';
  }
  if (me.tenantRoles.includes('RIDER')) return 'רוכב בקהילה';
  if (me.tenantRoles.includes('PARENT')) return 'הורה / אפוטרופוס';
  return 'חבר קהילה';
}

export default function HomeLauncherPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    getMe()
      .then(setMe)
      .catch(() => {
        clearSession();
        router.replace('/login');
      });
  }, [router]);

  const name = useMemo(() => (me ? greetingName(me.fullName) : null), [me]);
  const role = useMemo(() => (me ? roleLabel(me) : ''), [me]);
  const portals = useMemo(() => {
    if (!me) return [];
    const mine = new Set([...me.tenantRoles, ...me.platformRoles]);
    return PORTALS.filter((p) => p.roles.some((r) => mine.has(r)));
  }, [me]);

  if (!me) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-void">
        <p className="text-sm text-white/50">טוען…</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-void text-white">
      <div className="absolute inset-0">
        <Image
          src="/media/hero-ride.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-45"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-void/75 to-void" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-lg flex-col px-5 pb-10 pt-6">
        <header className="flex items-center justify-between">
          <BrandMark href={null} size={40} priority />
          <button
            type="button"
            onClick={() => {
              clearSession();
              router.replace('/login');
            }}
            className="text-sm font-medium text-white/55 transition hover:text-white"
          >
            יציאה
          </button>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <h1 className="mt-4 text-[40px] font-extrabold leading-[1.05] tracking-tight">
            {name ? (
              <>
                שלום, {name}
                <br />
                <span className="text-white/55">לאן נכנסים?</span>
              </>
            ) : (
              <>
                ברוך הבא
                <br />
                <span className="text-white/55">לאן נכנסים?</span>
              </>
            )}
          </h1>
          <p className="mt-3 text-sm text-white/55">{role}</p>
          {me.activeTenant ? (
            <p className="mt-1 text-xs text-white/40">ארגון: {me.activeTenant.name}</p>
          ) : null}
        </motion.section>

        <section className="mt-8 grid grid-cols-2 gap-3">
          {portals.map((portal, i) => (
            <motion.div
              key={portal.href}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={portal.href}
                className={`group relative flex min-h-[168px] flex-col justify-between overflow-hidden bg-gradient-to-br ${portal.tone} p-4 ring-1 ring-white/10 transition duration-base hover:ring-white/25`}
              >
                <div className="relative">
                  <p className="text-xs font-medium text-white/45">{portal.statLabel}</p>
                  <p className="mt-1 text-[28px] font-extrabold tabular-nums tracking-tight">
                    {portal.stat}
                  </p>
                </div>
                <div className="relative">
                  <p className="text-[20px] font-extrabold tracking-tight">{portal.label}</p>
                  <p className="mt-1 text-xs leading-snug text-white/55">{portal.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </section>

        <footer className="mt-auto flex items-center justify-between pt-10 text-xs font-semibold text-white/40">
          <Link href="/" className="hover:text-white/70">
            דף נחיתה
          </Link>
          <Link href="/emulator" className="hover:text-accent">
            Preview lab
          </Link>
        </footer>
      </div>
    </main>
  );
}
