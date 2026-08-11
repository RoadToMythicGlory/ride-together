'use client';

import { LegalDoc } from '@/components/chrome/LegalDoc';
import { COOKIES_HE, LEGAL } from '@/content/legal';

export default function CookiesPage() {
  return (
    <LegalDoc
      title="עוגיות ואחסון מקומי"
      subtitle="מה נשמר במכשיר לצורך התחברות ותפעול."
      version={LEGAL.cookiesVersion}
      sections={COOKIES_HE}
    />
  );
}
