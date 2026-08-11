'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

const RULES = [
  {
    t: 'אין חשבונות לילדים',
    d: 'בלי פרופיל, בלי הודעות, בלי רשימת חברים, בלי יצירת קשר עם מבוגרים דרך האפליקציה.',
  },
  {
    t: 'מידע מלא רק לצוות מורשה',
    d: 'סיפורים רגישים ופרטים מזהים נשארים אצל מנהלי קהילה כברירת מחדל. רוכבים מקבלים סיכום תפעולי — אלא אם המשפחה בחרה לשתף את הסיפור.',
  },
  {
    t: 'בלי חשיפת כתובת או בית ספר',
    d: 'אין פרסום כתובות מגורים, בתי ספר או מידע רפואי רגיש — אלא בהסכמה מפורשת וכשהכרחי לבטיחות.',
  },
  {
    t: 'כבוד ושייכות',
    d: 'הדגש הוא על נוכחות מכבדת — לא על חשיפת כאב. סיפור אישי לא מתפרסם אלא אם ההורה בחר במפורש ״שתפו את הסיפור״.',
  },
];

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-lg items-center justify-between px-5 py-5">
        <Link href="/" className="text-[15px] font-extrabold tracking-tight">
          RideTogether
        </Link>
        <Link href="/about" className="text-sm font-semibold text-accent">
          על המשימה
        </Link>
      </header>

      <div className="mx-auto max-w-lg px-5 pb-20">
        <h1 className="mt-4 text-[34px] font-extrabold leading-tight tracking-tight text-ink">
          פרטיות ובטיחות
          <br />
          לפני הכול
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          המערכת נבנתה מתוך ההבנה שמדובר בקטינים. פרטיותם היא ערך יסוד — לא פיצ׳ר משני.
        </p>

        <ul className="mt-10 divide-y divide-line border-y border-line">
          {RULES.map((r) => (
            <li key={r.t} className="py-6">
              <p className="text-base font-extrabold text-ink">{r.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.d}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 space-y-3">
          <Button href="/contact" variant="secondary">
            יצירת קשר
          </Button>
          <Button href="/register">הצטרפות</Button>
        </div>
      </div>
    </main>
  );
}
