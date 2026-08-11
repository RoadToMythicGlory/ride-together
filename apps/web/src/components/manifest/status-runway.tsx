'use client';

import { motion, useReducedMotion } from 'framer-motion';

export type RunwayStep = {
  id: string;
  label: string;
};

export function StatusRunway({
  steps,
  activeIndex,
}: {
  steps: RunwayStep[];
  activeIndex: number;
}) {
  const reduce = useReducedMotion();
  const progress = steps.length <= 1 ? 1 : activeIndex / (steps.length - 1);

  return (
    <div className="relative pt-2">
      <div className="relative h-1 rounded-full bg-line">
        <motion.div
          className="absolute inset-y-0 right-0 rounded-full bg-accent"
          initial={reduce ? false : { width: '0%' }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_4px_var(--accent-soft)]"
          initial={reduce ? false : { right: '0%' }}
          animate={{ right: `calc(${progress * 100}% - 6px)` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((step, i) => {
          const state = i < activeIndex ? 'done' : i === activeIndex ? 'now' : 'next';
          return (
            <div key={step.id} className="text-center">
              <p
                className={`text-[11px] font-bold leading-snug ${
                  state === 'now'
                    ? 'text-accent'
                    : state === 'done'
                      ? 'text-ink'
                      : 'text-muted/70'
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
