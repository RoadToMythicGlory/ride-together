'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
export function EventPoster({
  href,
  title,
  region,
  when,
  childrenCount,
  riders,
  riderTarget,
  summary,
  index = 0,
  imageSrc = '/media/community-ride.jpg',
}: {
  href: string;
  title: string;
  region: string;
  when: string;
  childrenCount: number;
  riders: number;
  riderTarget: number;
  /** One-line orientation — what people are coming for */
  summary?: string;
  index?: number;
  imageSrc?: string;
  /** @deprecated ignored */
  live?: boolean;
}) {
  const pct = Math.min(100, Math.round((riders / Math.max(riderTarget, 1)) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={href}
        className="group relative block min-h-[248px] overflow-hidden border border-ink/10"
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover object-[28%_center] transition duration-[700ms] ease-out group-hover:scale-[1.03]"
          sizes="(max-width:768px) 100vw, 420px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/65 to-void/20" />

        <div className="relative flex min-h-[248px] flex-col justify-between p-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm font-medium text-white/70">{region}</span>
            <span className="text-sm text-white/60">{when}</span>
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] text-accent">{region}</p>
            <h3 className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight">{title}</h3>
            {summary ? (
              <p className="mt-2 max-w-[34ch] text-[13px] leading-snug text-white/75">{summary}</p>
            ) : null}

            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="flex gap-5">
                <div>
                  <p className="text-[22px] font-extrabold tabular-nums leading-none">{childrenCount}</p>
                  <p className="mt-1 text-[10px] text-white/50">ילדים</p>
                </div>
                <div>
                  <p className="text-[22px] font-extrabold tabular-nums leading-none">
                    {riders}
                    <span className="text-white/40">/{riderTarget}</span>
                  </p>
                  <p className="mt-1 text-[10px] text-white/50">רוכבים</p>
                </div>
              </div>
              <div className="w-24">
                <div className="h-1 overflow-hidden rounded-full bg-white/20">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
