'use client';

import { MarketingShell } from '@/components/chrome/MarketingShell';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';

export default function ParentOnboardingPage() {
  return (
    <MarketingShell title="פרופיל הורה" subtitle="פרטי קשר ואישור פרטיות.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Field label="טלפון" type="tel" />
        <Field label="עיר" />
        <label className="flex items-start gap-3 text-sm text-muted">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" />
          מאשר/ת את מדיניות הפרטיות
        </label>
        <Button href="/parent">שמירה והמשך</Button>
      </form>
    </MarketingShell>
  );
}
