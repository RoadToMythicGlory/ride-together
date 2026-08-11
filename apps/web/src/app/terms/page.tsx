'use client';

import { LegalDoc } from '@/components/chrome/LegalDoc';
import { LEGAL, TERMS_HE } from '@/content/legal';

export default function TermsPage() {
  return (
    <LegalDoc
      title="תנאי שימוש"
      subtitle="כללים לשימוש בפלטפורמה למבוגרים — ילדים אינם משתמשי האפליקציה."
      version={LEGAL.termsVersion}
      sections={TERMS_HE}
    />
  );
}
