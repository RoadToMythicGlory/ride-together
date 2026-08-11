'use client';

import { motion } from 'framer-motion';
import type { MeetupBrief } from '@/content/meetups';

/** Practical orientation block: what the meetup is + who it's for. Stories only if family opted in. */
export function MeetupBriefBlock({
  brief,
  className = '',
}: {
  brief: MeetupBrief;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.3 }}
      className={`space-y-5 border-t border-line pt-5 ${className}`}
    >
      <section>
        <p className="text-[11px] font-bold tracking-[0.14em] text-accent">על המפגש</p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">{brief.about}</p>
      </section>

      <section>
        <p className="text-[11px] font-bold tracking-[0.14em] text-accent">למי זה מיועד</p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">{brief.forWhom}</p>
      </section>

      <section>
        <p className="text-[11px] font-bold tracking-[0.14em] text-accent">מה קורה במפגש</p>
        <ol className="mt-3 space-y-2.5">
          {brief.flow.map((step, i) => (
            <li key={step} className="flex gap-3 text-[14px] leading-snug text-ink">
              <span className="w-5 shrink-0 tabular-nums font-extrabold text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </motion.div>
  );
}
