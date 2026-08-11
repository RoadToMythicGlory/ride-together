'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function ManifestRow({
  title,
  meta,
  href,
  index = 0,
  accent = 'accent',
  trailing,
}: {
  title: string;
  meta?: string;
  href?: string;
  index?: number;
  accent?: 'accent' | 'ink' | 'muted';
  trailing?: ReactNode;
}) {
  const edge =
    accent === 'ink' ? 'bg-void' : accent === 'muted' ? 'bg-line' : 'bg-accent';

  const body = (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.04, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: -2 }}
      className="group relative flex items-stretch overflow-hidden border-b border-line"
    >
      <span className={`w-1 shrink-0 ${edge} transition-all duration-base group-hover:w-1.5`} />
      <div className="flex flex-1 items-center justify-between gap-3 px-3 py-4">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold tracking-tight text-ink">{title}</p>
          {meta ? <p className="mt-0.5 truncate text-sm text-muted">{meta}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-muted">
          {trailing}
          {href ? (
            <span className="text-lg transition-transform duration-fast group-hover:-translate-x-0.5">
              ‹
            </span>
          ) : null}
        </div>
      </div>
    </motion.div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
