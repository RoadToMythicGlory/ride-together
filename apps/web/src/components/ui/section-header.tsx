import type { ReactNode } from 'react';

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-end justify-between gap-3">
      <h2 className="text-sm font-semibold tracking-wide text-muted">{title}</h2>
      {action}
    </div>
  );
}
