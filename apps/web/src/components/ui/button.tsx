'use client';

import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-deep active:scale-[0.98] shadow-soft',
  secondary:
    'bg-surface text-ink border border-line hover:border-ink/20 active:scale-[0.98]',
  ghost: 'bg-transparent text-ink hover:bg-ink/[0.04] active:scale-[0.98]',
  danger: 'bg-danger text-white hover:opacity-90 active:scale-[0.98]',
};

export function Button({
  children,
  variant = 'primary',
  href,
  className = '',
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `inline-flex w-full items-center justify-center rounded-md px-4 py-3.5 text-[15px] font-semibold tracking-tight transition duration-fast ease-out disabled:opacity-50 ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={props.type ?? 'button'} className={cls} {...props}>
      {children}
    </button>
  );
}
