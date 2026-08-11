'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';

export default function RiderOnboardingPage() {
  return (
    <AppChrome
      area="rider"
      title="פרופיל רוכב"
      subtitle="כדי לקבל מפגשים רלוונטיים לאזור שלך."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Field label="עיר מגורים" />
        <Field label="אזורי התראה" placeholder="הרצליה, רמת השרון…" />
        <Field label="סוג אופנוע" placeholder="אופציונלי" />
        <Button href="/rider">שמירה והמשך</Button>
      </form>
    </AppChrome>
  );
}
