'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Editorial cover stage:
 * tall photo + type on media + overlapping content sheet.
 * Not a SaaS card. Not a neon AI widget.
 */
export function MetricStage({
  eyebrow,
  title,
  children,
  footer,
  imageSrc = '/media/hero-ride.jpg',
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  imageSrc?: string;
  /** @deprecated */
  live?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div className="relative h-[240px] overflow-hidden">
        <Image
          src={imageSrc}
          alt=""
          fill
          priority
          className={`object-cover ${imageSrc.includes('community') ? 'object-[28%_center]' : ''}`}
          sizes="(max-width:768px) 100vw, 480px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-void/10" />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-14 pt-8 text-white">
          {eyebrow ? (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="text-sm font-medium text-white/70"
            >
              {eyebrow}
            </motion.p>
          ) : null}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="mt-2 max-w-[16ch] text-[32px] font-extrabold leading-[1.08] tracking-tight"
          >
            {title}
          </motion.h2>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 -mt-10 mx-4 border border-line bg-surface px-5 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
      >
        {children}
        {footer ? <div className="mt-5">{footer}</div> : null}
      </motion.div>
    </motion.section>
  );
}
