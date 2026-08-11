'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function MarketingShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="rt-container flex items-center justify-between px-5 py-5">
        <Link href="/" className="text-[15px] font-extrabold tracking-tight text-ink">
          RideTogether
        </Link>
        <Link href="/login" className="text-sm font-semibold text-accent">
          כניסה
        </Link>
      </header>
      <main className="rt-container px-5 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-[34px] font-extrabold leading-[1.1] tracking-tight text-ink">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{subtitle}</p>
          ) : null}
          <div className="mt-8">{children}</div>
        </motion.div>
      </main>
      <footer className="rt-container flex flex-wrap gap-4 px-5 pb-10 text-xs font-semibold text-muted">
        <Link href="/privacy">פרטיות</Link>
        <Link href="/terms">תנאים</Link>
        <Link href="/cookies">עוגיות</Link>
        <Link href="/safety">בטיחות</Link>
        <Link href="/contact">יצירת קשר</Link>
      </footer>
    </div>
  );
}
