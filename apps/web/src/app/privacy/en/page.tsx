import { LegalDoc } from '@/components/chrome/LegalDoc';
import { LEGAL, PRIVACY_EN } from '@/content/legal';

export default function PrivacyEnglishPage() {
  return <LegalDoc title="Privacy Policy" subtitle="How RideTogether handles adult account and guardian-submitted information." version={LEGAL.privacyVersion} sections={PRIVACY_EN} />;
}
