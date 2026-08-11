'use client';

import Link from 'next/link';
import { MarketingShell } from '@/components/chrome/MarketingShell';
import type { LegalSection } from '@/content/legal';

export function LegalDoc({
  title,
  subtitle,
  version,
  sections,
}: {
  title: string;
  subtitle: string;
  version: string;
  sections: LegalSection[];
}) {
  return (
    <MarketingShell title={title} subtitle={subtitle}>
      <p className="mb-8 text-xs text-muted">גרסה {version}</p>
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-[18px] font-extrabold tracking-tight text-ink">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((p) => (
                <p key={p.slice(0, 48)} className="text-[15px] leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <nav className="mt-12 flex flex-wrap gap-4 border-t border-line pt-6 text-sm font-semibold">
        <Link href="/privacy" className="text-accent">
          פרטיות
        </Link>
        <Link href="/privacy/en" className="text-accent">
          Privacy (EN)
        </Link>
        <Link href="/terms" className="text-accent">
          תנאים
        </Link>
        <Link href="/terms/en" className="text-accent">
          Terms (EN)
        </Link>
        <Link href="/cookies" className="text-accent">
          עוגיות
        </Link>
        <Link href="/safety" className="text-accent">
          בטיחות
        </Link>
        <Link href="/contact" className="text-ink">
          יצירת קשר
        </Link>
      </nav>
    </MarketingShell>
  );
}
