'use client';

import { MarketingShell } from '@/components/chrome/MarketingShell';
import { Button } from '@/components/ui/button';
import { Field, TextArea } from '@/components/ui/field';
import { LEGAL } from '@/content/legal';

export default function ContactPage() {
  return (
    <MarketingShell
      title="יצירת קשר"
      subtitle={`תמיכה לחנות האפליקציות ולמשתמשים — ${LEGAL.supportEmail}`}
    >
      <p className="mb-6 text-[15px] leading-relaxed text-muted">
        לפניות פרטיות, מחיקת חשבון או דיווח בטיחות — כתבו אלינו. ניתן גם למחוק חשבון ישירות מתוך{' '}
        <a href="/settings/delete" className="font-semibold text-accent">
          הגדרות → מחיקת חשבון
        </a>
        .
      </p>
      <form
        className="space-y-4"
        action={`mailto:${LEGAL.supportEmail}`}
        method="get"
        encType="text/plain"
      >
        <Field label="שם" name="name" required />
        <Field label="אימייל" name="email" type="email" required />
        <TextArea label="הודעה" name="body" required />
        <input type="hidden" name="subject" value="RideTogether support" />
        <Button type="submit">שליחה בדוא״ל</Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        או ישירות:{' '}
        <a className="font-semibold text-accent" href={`mailto:${LEGAL.supportEmail}`}>
          {LEGAL.supportEmail}
        </a>
      </p>
    </MarketingShell>
  );
}
