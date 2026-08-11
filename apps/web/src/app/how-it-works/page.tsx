'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    n: '01',
    t: 'הורה מגיש בקשה',
    d: 'משתף את ההקשר בפרטיות, מאשר הסכמות, וממתין לבדיקת הצוות.',
  },
  {
    n: '02',
    t: 'מארגן מאמת ובונה מפגש',
    d: 'בודק בקשות, משבץ כמה ילדים יחד, ומתכנן מפגש בטוח ומכבד.',
  },
  {
    n: '03',
    t: 'רוכבים מקבלים התראה',
    d: 'לפי אזורי ההתראה שבחרתם — בלי סיפורים פרטיים כברירת מחדל, רק מה שצריך כדי להגיע (אלא אם המשפחה בחרה לשתף).',
  },
  {
    n: '04',
    t: 'מגיעים — וחוזרים',
    d: 'המטרה אינה יום אחד מרגש, אלא פנים מוכרות וקהילה שנמשכת.',
  },
];

export default function HowItWorksPage() {
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

      <div className="relative h-48 overflow-hidden">
        <Image src="/media/community-ride.jpg" alt="" fill className="object-cover object-[28%_center]" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-void/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-lg px-5 pb-20">
        <h1 className="mt-6 text-[34px] font-extrabold leading-tight tracking-tight text-ink">
          איך זה עובד
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          הפלטפורמה למבוגרים. הילדים משתתפים במפגשים בעולם האמיתי בלבד.
        </p>

        <ol className="mt-10 divide-y divide-line border-y border-line">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-5 py-7">
              <span className="text-sm font-extrabold tabular-nums text-accent">{s.n}</span>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-ink">{s.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 space-y-3">
          <Button href="/register">מתחילים</Button>
          <Button href="/safety" variant="secondary">
            בטיחות ופרטיות
          </Button>
        </div>
      </div>
    </main>
  );
}
