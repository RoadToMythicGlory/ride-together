import { LegalDoc } from '@/components/chrome/LegalDoc';
import { LEGAL, TERMS_EN } from '@/content/legal';

export default function TermsEnglishPage() {
  return <LegalDoc title="Terms of Service" subtitle="Terms for RideTogether's adult community coordination service." version={LEGAL.termsVersion} sections={TERMS_EN} />;
}
