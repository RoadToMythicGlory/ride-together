'use client';

import Link from 'next/link';
import { AppChrome } from '@/components/chrome/AppChrome';
import { ManifestRow } from '@/components/manifest/manifest-row';
import { LEGAL } from '@/content/legal';
import { clearSession } from '@/lib/api';
import { useTheme } from '@/lib/theme';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <AppChrome area="public" title="הגדרות חשבון" subtitle="פרטיות, ייצוא ומחיקה — חובה לחנויות האפליקציות.">
      <section className="mb-8 rounded-none border border-line bg-surface px-4 py-4">
        <p className="text-[11px] font-bold tracking-[0.14em] text-accent">סטטוס חנות</p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">
          RideTogether מיועדת למבוגרים בלבד ({LEGAL.minAge}+). ילדים אינם משתמשי האפליקציה. דירוג מוצהר:{' '}
          {LEGAL.storeAgeRating}.
        </p>
      </section>

      <section className="mb-8 border border-line bg-surface px-4 py-4">
        <p className="text-[11px] font-bold tracking-[0.14em] text-accent">מראה</p>
        <p className="mt-2 text-sm text-muted">ברירת המחדל היא מצב כהה.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`py-3 text-sm font-semibold ${
              theme === 'dark' ? 'bg-accent text-white' : 'border border-line text-ink'
            }`}
          >
            כהה
          </button>
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`py-3 text-sm font-semibold ${
              theme === 'light' ? 'bg-accent text-white' : 'border border-line text-ink'
            }`}
          >
            בהיר
          </button>
        </div>
      </section>

      <p className="mb-2 text-sm font-medium text-muted">משפטי</p>
      <ManifestRow index={0} title="מדיניות פרטיות" meta={`גרסה ${LEGAL.privacyVersion}`} href="/privacy" />
      <ManifestRow index={1} title="תנאי שימוש" meta={`גרסה ${LEGAL.termsVersion}`} href="/terms" />
      <ManifestRow index={2} title="עוגיות ואחסון מקומי" href="/cookies" />
      <ManifestRow index={3} title="בטיחות וילדים" meta="לא אפליקציית ילדים" href="/safety" />

      <p className="mb-2 mt-8 text-sm font-medium text-muted">הנתונים שלי</p>
      <ManifestRow index={0} title="ייצוא נתונים" meta="הורדת עותק JSON" href="/settings/export" />
      <ManifestRow
        index={1}
        title="מחיקת חשבון"
        meta="בלתי הפיך"
        href="/settings/delete"
        accent="muted"
      />

      <p className="mb-2 mt-8 text-sm font-medium text-muted">תמיכה</p>
      <ManifestRow index={0} title="יצירת קשר" meta={LEGAL.supportEmail} href="/contact" />

      <button
        type="button"
        className="mt-10 w-full border border-line py-3 text-sm font-semibold text-ink"
        onClick={() => {
          clearSession();
          window.location.href = '/login';
        }}
      >
        התנתקות
      </button>

      <p className="mt-6 text-center text-xs text-muted">
        <Link href="/home" className="font-semibold text-accent">
          חזרה לפורטל
        </Link>
      </p>
    </AppChrome>
  );
}
