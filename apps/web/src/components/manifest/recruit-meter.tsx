'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function RecruitMeter({
  value,
  max,
  label = 'רוכבים מאושרים',
}: {
  value: number;
  max: number;
  label?: string;
}) {
  const reduce = useReducedMotion();
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  const remaining = Math.max(0, max - value);

  return (
    <div className="flex gap-4">
      <div className="w-1 shrink-0 bg-accent" />
      <div className="min-w-0 flex-1">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[48px] font-extrabold leading-none tracking-tight tabular-nums text-ink">
              {value}
              <span className="text-[20px] font-bold text-muted">/{max}</span>
            </p>
            <p className="mt-2 text-sm text-muted">{label}</p>
          </div>
          <div className="pb-1 text-left">
            <p className="text-[22px] font-extrabold tabular-nums text-accent">{remaining}</p>
            <p className="text-xs text-muted">חסרים ליעד</p>
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden bg-line">
          <motion.div
            className="h-full bg-accent"
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
