'use client';

import { MarketingShell } from '@/components/chrome/MarketingShell';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  return (
    <MarketingShell title="מי אתם?" subtitle="אפשר גם את שני התפקידים — בלי שני חשבונות.">
      <div className="space-y-8">
        <div className="border-b border-line pb-8">
          <h2 className="text-xl font-extrabold tracking-tight">רוכב/ת</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            מגלים מפגשים, מאשרים הגעה, מקבלים התראות לפי עיר או אזור.
          </p>
          <div className="mt-5">
            <Button href="/onboarding/rider">המשך כרוכב</Button>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">הורה / אפוטרופוס</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            מגישים בקשה לילד, עוקבים אחרי סטטוס, מאשרים השתתפות.
          </p>
          <div className="mt-5">
            <Button href="/onboarding/parent" variant="secondary">
              המשך כהורה
            </Button>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
