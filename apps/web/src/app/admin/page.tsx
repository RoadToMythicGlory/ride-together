'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { ManifestRow } from '@/components/manifest/manifest-row';
import { MetricStage } from '@/components/manifest/metric-stage';

export default function AdminHomePage() {
  return (
    <AppChrome area="admin" title="מערכת" subtitle="ניהול הפלטפורמה.">
      <MetricStage
        imageSrc="/media/hero-ride.jpg"
        eyebrow="RideTogether"
        title={
          <>
            סטטוס
            <br />
            הפלטפורמה
          </>
        }
      >
        <div className="grid grid-cols-3 gap-4">
          {[
            { v: '1', l: 'ארגון פעיל' },
            { v: '8', l: 'אזורים' },
            { v: '99.9%', l: 'זמינות' },
          ].map((m) => (
            <div key={m.l} className="border-r border-line pl-3 last:border-r-0 last:pl-0">
              <p className="text-[26px] font-extrabold tabular-nums tracking-tight text-ink">
                {m.v}
              </p>
              <p className="mt-1 text-xs text-muted">{m.l}</p>
            </div>
          ))}
        </div>
      </MetricStage>

      <section className="mt-10">
        <p className="mb-2 text-sm font-medium text-muted">ניהול</p>
        <ManifestRow index={0} title="משתמשים" href="/admin/users" />
        <ManifestRow index={1} title="תפקידים והרשאות" href="/admin/roles" />
        <ManifestRow index={2} title="אזורים וערים" href="/admin/regions" />
        <ManifestRow index={3} title="יומן ביקורת" href="/admin/audit" />
        <ManifestRow index={4} title="אנליטיקה" href="/admin/analytics" />
        <ManifestRow index={5} title="הגדרות" href="/admin/settings" accent="ink" />
        <ManifestRow index={6} title="מודרציה" href="/admin/moderation" accent="muted" />
      </section>
    </AppChrome>
  );
}
