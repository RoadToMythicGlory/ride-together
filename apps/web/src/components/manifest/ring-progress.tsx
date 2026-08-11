'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function RingProgress({
  value,
  max,
  size = 168,
  stroke = 8,
  label,
  sublabel,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}) {
  const reduce = useReducedMotion();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, value / Math.max(max, 1));
  const offset = circumference * (1 - pct);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduce ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[40px] font-extrabold leading-none tracking-tight tabular-nums text-ink">
          {value}
          <span className="text-muted">/{max}</span>
        </p>
        {label ? <p className="mt-2 text-xs font-semibold text-muted">{label}</p> : null}
        {sublabel ? <p className="mt-0.5 text-[11px] text-muted/80">{sublabel}</p> : null}
      </div>
    </div>
  );
}
