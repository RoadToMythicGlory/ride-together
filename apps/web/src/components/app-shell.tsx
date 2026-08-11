'use client';

import type { ReactNode } from 'react';
import { AppChrome } from '@/components/chrome/AppChrome';
import { MarketingShell } from '@/components/chrome/MarketingShell';
import { Button } from '@/components/ui/button';
import { ListRow } from '@/components/ui/list-row';
import { StatusText } from '@/components/ui/status-text';

/** @deprecated Prefer AppChrome / MarketingShell directly */
export function AppShell({
  area,
  title,
  subtitle,
  children,
}: {
  area: 'rider' | 'parent' | 'manager' | 'admin' | 'public';
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  if (area === 'public') {
    return (
      <MarketingShell title={title} subtitle={subtitle}>
        {children}
      </MarketingShell>
    );
  }
  return (
    <AppChrome area={area} title={title} subtitle={subtitle}>
      {children}
    </AppChrome>
  );
}

/** Flat content block — no card chrome */
export function Panel({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      {title ? (
        <h2 className="text-sm font-semibold tracking-wide text-muted">{title}</h2>
      ) : null}
      <div className="text-[15px] leading-relaxed text-ink">{children}</div>
    </section>
  );
}

export function Row({
  title,
  meta,
  href,
}: {
  title: string;
  meta?: string;
  href?: string;
}) {
  return <ListRow title={title} meta={meta} href={href} />;
}

export function PrimaryButton({
  children,
  href,
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <Button href={href} variant="primary">
      {children}
    </Button>
  );
}

export function GhostButton({
  children,
  href,
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <Button href={href} variant="secondary">
      {children}
    </Button>
  );
}

export function StatusPill({ children }: { children: ReactNode }) {
  return <StatusText tone="accent">{children}</StatusText>;
}
