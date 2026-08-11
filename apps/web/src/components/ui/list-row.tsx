import Link from 'next/link';
import type { ReactNode } from 'react';

export function ListRow({
  title,
  meta,
  href,
  trailing,
}: {
  title: string;
  meta?: string;
  href?: string;
  trailing?: ReactNode;
}) {
  const body = (
    <div className="flex items-center justify-between gap-3 border-b border-line px-1 py-4 transition duration-fast hover:bg-ink/[0.02]">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold tracking-tight text-ink">{title}</p>
        {meta ? <p className="mt-0.5 truncate text-sm text-muted">{meta}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-muted">
        {trailing}
        {href ? <span className="text-lg leading-none">‹</span> : null}
      </div>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
