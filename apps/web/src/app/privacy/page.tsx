'use client';

import { LegalDoc } from '@/components/chrome/LegalDoc';
import { LEGAL, PRIVACY_HE } from '@/content/legal';

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="מדיניות פרטיות"
      subtitle="איך RideTogether אוספת ושומרת מידע — כולל מידע על ילדים שמוזן רק על ידי הורים."
      version={LEGAL.privacyVersion}
      sections={PRIVACY_HE}
    />
  );
}
