import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app');

const pages = [
  // public
  ['about/page.tsx', publicPage('על המשימה', 'קהילה שמראה נוכחות.', [
    'RideTogether מחברת הורים, מארגנים ורוכבים.',
    'המטרה: מפגשים חוזרים של שייכות ותמיכה.',
    'ילדים משתתפים בעולם האמיתי, לא כמשתמשי מערכת.',
  ])],
  ['how-it-works/page.tsx', publicPage('איך זה עובד', 'ארבעה שלבים פשוטים.', [
    '1. הורה/אפוטרופוס מגיש בקשה.',
    '2. מארגן קהילה בודק ומאשר.',
    '3. נוצר מפגש לכמה ילדים יחד.',
    '4. רוכבים מגיעים לפי אזור ומאשרים הגעה.',
  ])],
  ['safety/page.tsx', publicPage('בטיחות ופרטיות', 'פרטיות הילדים היא קו אדום.', [
    'אין חשבונות לילדים, אין הודעות, אין פרופיל ציבורי.',
    'סיפורים רגישים גלויים רק לצוות מורשה.',
    'רוכבים רואים רק סיכום ציבורי של המפגש.',
    'מיקום מדויק נחשף לפי מדיניות המפגש.',
  ])],
  ['contact/page.tsx', contactPage()],
  ['forgot-password/page.tsx', forgotPage()],

  // onboarding
  ['onboarding/page.tsx', onboardingSelect()],
  ['onboarding/rider/page.tsx', formPage('rider', 'השלמת פרופיל רוכב', 'כדי לקבל מפגשים רלוונטיים.', [
    ['עיר מגורים', 'text'],
    ['אזורי התראה', 'text'],
    ['סוג אופנוע (אופציונלי)', 'text'],
  ], '/rider')],
  ['onboarding/parent/page.tsx', formPage('public', 'השלמת פרופיל הורה', 'פרטי קשר ואישור פרטיות.', [
    ['טלפון ליצירת קשר', 'tel'],
    ['עיר', 'text'],
  ], '/parent', true)],

  // rider
  ['rider/page.tsx', riderHome()],
  ['rider/events/page.tsx', riderEvents()],
  ['rider/events/demo/page.tsx', riderEventDetail()],
  ['rider/upcoming/page.tsx', listPage('rider', 'המפגשים שלי', 'RSVP פעילים.', [
    ['מפגש שרון · שבת 11:00', 'מאושר', '/rider/events/demo'],
    ['מפגש תל אביב · בעוד שבועיים', 'מעוניין', '/rider/events/demo'],
  ])],
  ['rider/history/page.tsx', listPage('rider', 'היסטוריית השתתפות', 'מפגשים קודמים.', [
    ['מפגש צפון · הושלם', 'נכחת', '/rider/events/demo'],
    ['מפגש מרכז · הושלם', 'נכחת', '/rider/events/demo'],
  ])],
  ['rider/notifications/page.tsx', notifPrefs()],
  ['rider/profile/page.tsx', profilePage()],

  // parent
  ['parent/page.tsx', parentHome()],
  ['parent/applications/new/page.tsx', newApplication()],
  ['parent/applications/page.tsx', listPage('parent', 'הבקשות שלי', 'כל הבקשות שהוגשו.', [
    ['בקשה עבור נועם', 'בבדיקה', '/parent/applications/demo'],
    ['בקשה עבור מאיה', 'שובצה למפגש', '/parent/event'],
  ])],
  ['parent/applications/demo/page.tsx', applicationStatus()],
  ['parent/applications/demo/more-info/page.tsx', moreInfo()],
  ['parent/event/page.tsx', parentEvent()],
  ['parent/confirm/page.tsx', parentConfirm()],
  ['parent/consents/page.tsx', consents()],

  // manager
  ['manager/page.tsx', managerHome()],
  ['manager/applications/page.tsx', listPage('manager', 'בקשות ממתינות', 'דורשות בדיקה.', [
    ['בקשה #1042 · שרון', 'חדשה', '/manager/applications/demo'],
    ['בקשה #1038 · תל אביב', 'מידע נוסף התקבל', '/manager/applications/demo'],
  ])],
  ['manager/applications/demo/page.tsx', managerReview()],
  ['manager/waiting/page.tsx', listPage('manager', 'מאושרים בהמתנה', 'מוכנים לשיבוץ.', [
    ['ילד/ה · גיל 9 · שרון', 'מאושר', '/manager/events/demo/assign'],
    ['ילד/ה · גיל 11 · מרכז', 'מאושר', '/manager/events/demo/assign'],
  ])],
  ['manager/events/new/page.tsx', createEvent()],
  ['manager/events/demo/assign/page.tsx', assignChildren()],
  ['manager/events/demo/attendance/page.tsx', attendance()],
  ['manager/events/demo/ops/page.tsx', eventOps()],
  ['manager/notifications/page.tsx', managerNotifs()],
  ['manager/history/page.tsx', listPage('manager', 'היסטוריית מפגשים', 'מפגשים שהסתיימו.', [
    ['מפגש שרון · מרץ', 'הושלם · 52 רוכבים', '/manager/events/demo/ops'],
    ['מפגש צפון · פברואר', 'הושלם · 41 רוכבים', '/manager/events/demo/ops'],
  ])],

  // admin
  ['admin/page.tsx', adminHome()],
  ['admin/tenants/page.tsx', listPage('admin', 'ארגונים', 'Tenants בפלטפורמה.', [
    ['RideTogether', 'פעיל', '/admin/settings'],
    ['מועדון שותף (דוגמה)', 'טיוטה', '/admin/settings'],
  ])],
  ['admin/users/page.tsx', listPage('admin', 'משתמשים', 'חשבונות וחברויות.', [
    ['admin@ride-together.local', 'SUPER_ADMIN', '/admin/roles'],
    ['rider.parent@example.com', 'RIDER + PARENT', '/admin/roles'],
  ])],
  ['admin/roles/page.tsx', listPage('admin', 'תפקידים', 'תפקידי ארגון.', [
    ['ADMIN', 'ניהול ארגון', '/admin/permissions'],
    ['EVENT_MANAGER', 'תפעול מפגשים', '/admin/permissions'],
    ['RIDER', 'רוכב', '/admin/permissions'],
    ['PARENT', 'הורה', '/admin/permissions'],
  ])],
  ['admin/permissions/page.tsx', permissions()],
  ['admin/moderation/page.tsx', listPage('admin', 'מודרציה', 'תוכן ומדיה.', [
    ['מדיה ממתינה · מפגש שרון', 'PENDING', '/admin/moderation'],
    ['דיווח תוכן', 'OPEN', '/admin/moderation'],
  ])],
  ['admin/regions/page.tsx', regions()],
  ['admin/audit/page.tsx', listPage('admin', 'יומן ביקורת', 'פעולות רגישות.', [
    ['user.login · Platform Admin', 'לפני דקה', '/admin/audit'],
    ['notification_regions.updated', 'היום', '/admin/audit'],
  ])],
  ['admin/settings/page.tsx', settings()],
  ['admin/analytics/page.tsx', analytics()],
];

function publicPage(title, subtitle, lines) {
  return `'use client';

import Link from 'next/link';
import { AppShell, GhostButton, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="public" title=${JSON.stringify(title)} subtitle=${JSON.stringify(subtitle)}>
      <Panel>
        <ul className="space-y-3 text-sm leading-relaxed text-asphalt/80">
          ${lines.map((l) => `<li>• ${escape(l)}</li>`).join('\n          ')}
        </ul>
      </Panel>
      <div className="mt-4 space-y-3">
        <PrimaryButton href="/register">הצטרפות</PrimaryButton>
        <GhostButton href="/">חזרה לדף הבית</GhostButton>
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-sm text-signal">
        <Link href="/about">על המשימה</Link>
        <Link href="/how-it-works">איך זה עובד</Link>
        <Link href="/safety">בטיחות</Link>
        <Link href="/contact">צור קשר</Link>
      </div>
    </AppShell>
  );
}
`;
}

function contactPage() {
  return `'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="public" title="יצירת קשר" subtitle="נחזור אליכם בהקדם.">
      <Panel>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="שם" />
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="אימייל" type="email" />
          <textarea className="min-h-28 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="הודעה" />
          <PrimaryButton>שליחה</PrimaryButton>
        </form>
      </Panel>
    </AppShell>
  );
}
`;
}

function forgotPage() {
  return `'use client';

import Link from 'next/link';
import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="public" title="שחזור סיסמה" subtitle="נשלח קישור לאיפוס (בקרוב מחובר למייל).">
      <Panel>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="אימייל" type="email" />
          <PrimaryButton>שלחו לי קישור</PrimaryButton>
        </form>
      </Panel>
      <Link href="/login" className="mt-4 inline-block text-sm text-signal underline">חזרה לכניסה</Link>
    </AppShell>
  );
}
`;
}

function onboardingSelect() {
  return `'use client';

import { AppShell, GhostButton, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="public" title="מי אתם?" subtitle="אפשר לבחור גם את שני התפקידים.">
      <div className="space-y-3">
        <Panel title="רוכב/ת">
          <p className="mb-3 text-sm text-asphalt/70">מגלים מפגשים, מאשרים הגעה, מקבלים התראות לפי אזור.</p>
          <PrimaryButton href="/onboarding/rider">המשך כרוכב</PrimaryButton>
        </Panel>
        <Panel title="הורה / אפוטרופוס">
          <p className="mb-3 text-sm text-asphalt/70">מגישים בקשה לילד, עוקבים אחרי סטטוס, מאשרים השתתפות.</p>
          <GhostButton href="/onboarding/parent">המשך כהורה</GhostButton>
        </Panel>
        <GhostButton href="/register">גם וגם — דרך ההרשמה</GhostButton>
      </div>
    </AppShell>
  );
}
`;
}

function formPage(area, title, subtitle, fields, next, consent = false) {
  return `'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area=${JSON.stringify(area === 'rider' ? 'rider' : 'public')} title=${JSON.stringify(title)} subtitle=${JSON.stringify(subtitle)}>
      <Panel>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          ${fields.map(([label, type]) => `<input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder=${JSON.stringify(label)} type=${JSON.stringify(type)} />`).join('\n          ')}
          ${consent ? `<label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" /> מאשר/ת את מדיניות הפרטיות</label>` : ''}
          <PrimaryButton href=${JSON.stringify(next)}>שמירה והמשך</PrimaryButton>
        </form>
      </Panel>
    </AppShell>
  );
}
`;
}

function riderHome() {
  return `'use client';

import { AppShell, Panel, PrimaryButton, Row, StatusPill } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="rider" title="שלום רוכב" subtitle="הקהילה מחכה לנוכחות שלך.">
      <Panel>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-lg font-semibold">מפגש השבת · שרון</p>
          <StatusPill>פתוח לרוכבים</StatusPill>
        </div>
        <p className="text-sm text-asphalt/70">18 רוכבים כבר מצטרפים · יעד 60</p>
        <div className="mt-4"><PrimaryButton href="/rider/events/demo">לפרטים ו־RSVP</PrimaryButton></div>
      </Panel>
      <div className="mt-4 space-y-2">
        <Row title="מפגשים באזור" meta="לפי העדפות ההתראה שלך" href="/rider/events" />
        <Row title="המפגשים שלי" meta="אישורים והמתנה" href="/rider/upcoming" />
        <Row title="העדפות התראות" meta="ערים ואזורים" href="/rider/notifications" />
      </div>
    </AppShell>
  );
}
`;
}

function riderEvents() {
  return `'use client';

import { AppShell, Row } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="rider" title="מפגשים באזור" subtitle="רק סיכום ציבורי — בלי פרטי ילדים.">
      <div className="space-y-2">
        <Row title="Community Ride · שרון" meta="שבת 11:00 · 9 ילדים · 18 רוכבים" href="/rider/events/demo" />
        <Row title="מפגש מרכז" meta="שישי 16:00 · 6 ילדים · 12 רוכבים" href="/rider/events/demo" />
        <Row title="יום רוכבים צפון" meta="בעוד שבועיים · גיוס רוכבים" href="/rider/events/demo" />
      </div>
    </AppShell>
  );
}
`;
}

function riderEventDetail() {
  return `'use client';

import { AppShell, GhostButton, Panel, PrimaryButton, StatusPill } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="rider" title="Community Ride · שרון" subtitle="שבת 11:00 · נקודת מפגש תפורסם אחרי RSVP">
      <Panel>
        <div className="mb-3 flex flex-wrap gap-2">
          <StatusPill>9 ילדים מצטרפים</StatusPill>
          <StatusPill>18/60 רוכבים</StatusPill>
        </div>
        <p className="text-sm leading-relaxed text-asphalt/75">
          מפגש קהילתי באזור השרון. מיקום מדויק ייחשף לרוכבים שאושרו, לפי מדיניות המפגש.
        </p>
      </Panel>
      <div className="mt-4 space-y-3">
        <PrimaryButton href="/rider/upcoming">אשר הגעה (RSVP)</PrimaryButton>
        <GhostButton href="/rider/events">חזרה לרשימה</GhostButton>
      </div>
    </AppShell>
  );
}
`;
}

function listPage(area, title, subtitle, rows) {
  return `'use client';

import { AppShell, Row } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area=${JSON.stringify(area)} title=${JSON.stringify(title)} subtitle=${JSON.stringify(subtitle)}>
      <div className="space-y-2">
        ${rows.map(([t, m, h]) => `<Row title=${JSON.stringify(t)} meta=${JSON.stringify(m)} href=${JSON.stringify(h)} />`).join('\n        ')}
      </div>
    </AppShell>
  );
}
`;
}

function notifPrefs() {
  return `'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="rider" title="העדפות התראות" subtitle="עיר או אזור — בלי הרחבה אוטומטית.">
      <Panel title="מנויים נוכחיים">
        <ul className="space-y-2 text-sm">
          <li className="rounded-xl bg-ink/5 px-3 py-2">עיר · הרצליה</li>
          <li className="rounded-xl bg-ink/5 px-3 py-2">עיר · רמת השרון</li>
          <li className="rounded-xl bg-ink/5 px-3 py-2">אזור · תל אביב</li>
        </ul>
      </Panel>
      <div className="mt-4"><PrimaryButton href="/rider">שמירת העדפות</PrimaryButton></div>
    </AppShell>
  );
}
`;
}

function profilePage() {
  return `'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="rider" title="פרופיל רוכב" subtitle="הפרטים שלך בקהילה.">
      <Panel>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" defaultValue="שם מלא" />
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" defaultValue="עיר" />
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="אופנוע" />
          <PrimaryButton>שמירה</PrimaryButton>
        </form>
      </Panel>
    </AppShell>
  );
}
`;
}

function parentHome() {
  return `'use client';

import { AppShell, Panel, PrimaryButton, Row, StatusPill } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="parent" title="שלום הורה" subtitle="אנחנו כאן ללוות אתכם בבהירות ובבטיחות.">
      <Panel>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-display font-semibold">הבקשה עבור נועם</p>
          <StatusPill>בבדיקה</StatusPill>
        </div>
        <p className="text-sm text-asphalt/70">הצוות הקהילתי עובר על הבקשה.</p>
        <div className="mt-4"><PrimaryButton href="/parent/applications/demo">למעקב סטטוס</PrimaryButton></div>
      </Panel>
      <div className="mt-4 space-y-2">
        <Row title="הגשת בקשה חדשה" href="/parent/applications/new" />
        <Row title="הבקשות שלי" href="/parent/applications" />
        <Row title="ניהול הסכמות" href="/parent/consents" />
      </div>
    </AppShell>
  );
}
`;
}

function newApplication() {
  return `'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="parent" title="הגשת בקשה" subtitle="הילדים אינם מקבלים חשבון במערכת.">
      <Panel>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="כינוי להצגה" />
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="גיל" type="number" />
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="עיר / אזור" />
          <textarea className="min-h-28 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="הקשר / הסיפור (פרטי לצוות בלבד)" />
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" /> אישור הסכמה להשתתפות ומדיניות פרטיות</label>
          <PrimaryButton href="/parent/applications/demo">שליחת בקשה</PrimaryButton>
        </form>
      </Panel>
    </AppShell>
  );
}
`;
}

function applicationStatus() {
  return `'use client';

import { AppShell, GhostButton, Panel, PrimaryButton, StatusPill } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="parent" title="סטטוס בקשה" subtitle="בקשה עבור נועם">
      <Panel>
        <StatusPill>UNDER_REVIEW</StatusPill>
        <ol className="mt-4 space-y-2 text-sm text-asphalt/75">
          <li>✓ התקבלה</li>
          <li>● בבדיקה אצל צוות הקהילה</li>
          <li>○ אושרה / נדרש מידע נוסף</li>
          <li>○ שובצה למפגש</li>
        </ol>
      </Panel>
      <div className="mt-4 space-y-3">
        <PrimaryButton href="/parent/applications/demo/more-info">השלמת מידע</PrimaryButton>
        <GhostButton href="/parent/applications">כל הבקשות</GhostButton>
      </div>
    </AppShell>
  );
}
`;
}

function moreInfo() {
  return `'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="parent" title="השלמת מידע" subtitle="הצוות ביקש פרטים נוספים.">
      <Panel>
        <textarea className="min-h-36 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="התשובה שלכם לצוות" />
        <div className="mt-3"><PrimaryButton href="/parent/applications/demo">שליחה</PrimaryButton></div>
      </Panel>
    </AppShell>
  );
}
`;
}

function parentEvent() {
  return `'use client';

import { AppShell, Panel, PrimaryButton, StatusPill } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="parent" title="מפגש ששובץ" subtitle="יש לנו מפגש עבורכם">
      <Panel>
        <StatusPill>ASSIGNED_TO_EVENT</StatusPill>
        <p className="mt-3 font-display text-lg font-semibold">Community Ride · שרון</p>
        <p className="mt-1 text-sm text-asphalt/70">שבת 11:00 · פרטי הגעה יימסרו לפני המפגש</p>
      </Panel>
      <div className="mt-4"><PrimaryButton href="/parent/confirm">אישור / דחיית השתתפות</PrimaryButton></div>
    </AppShell>
  );
}
`;
}

function parentConfirm() {
  return `'use client';

import { AppShell, GhostButton, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="parent" title="אישור השתתפות" subtitle="אשרו הגעה למפגש ששובץ.">
      <Panel>
        <p className="text-sm text-asphalt/75">מפגש שרון · שבת 11:00 · עבור הכינוי שנבחר בבקשה.</p>
      </Panel>
      <div className="mt-4 space-y-3">
        <PrimaryButton href="/parent">מאשרים הגעה</PrimaryButton>
        <GhostButton href="/parent">לא נוכל הפעם</GhostButton>
      </div>
    </AppShell>
  );
}
`;
}

function consents() {
  return `'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

const items = ['השתתפות', 'מדיניות פרטיות', 'צילום', 'וידאו', 'פרסום ברשתות', 'שיתוף סיפור אנונימי', 'הזמנות עתידיות'];

export default function Page() {
  return (
    <AppShell area="parent" title="ניהול הסכמות" subtitle="כל הסכמה נפרדת ומתועדת.">
      <Panel>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item} className="flex items-center justify-between gap-3 text-sm">
              <span>{item}</span>
              <input type="checkbox" defaultChecked={item !== 'פרסום ברשתות'} />
            </li>
          ))}
        </ul>
        <div className="mt-4"><PrimaryButton>שמירת הסכמות</PrimaryButton></div>
      </Panel>
    </AppShell>
  );
}
`;
}

function managerHome() {
  return `'use client';

import { AppShell, Panel, Row, StatusPill } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="manager" title="לוח מארגן" subtitle="תמונת מצב תפעולית.">
      <div className="mb-4 grid grid-cols-3 gap-2">
        <Panel><p className="text-2xl font-bold">7</p><p className="text-xs text-asphalt/60">בקשות ממתינות</p></Panel>
        <Panel><p className="text-2xl font-bold">12</p><p className="text-xs text-asphalt/60">ממתינים לשיבוץ</p></Panel>
        <Panel><p className="text-2xl font-bold">18/60</p><p className="text-xs text-asphalt/60">רוכבים לשבת</p></Panel>
      </div>
      <Panel>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-semibold">מפגש שרון</p>
          <StatusPill>OPEN_FOR_RIDERS</StatusPill>
        </div>
        <p className="text-sm text-asphalt/70">נדרשים עוד 42 רוכבים ליעד.</p>
      </Panel>
      <div className="mt-4 space-y-2">
        <Row title="בקשות ממתינות" href="/manager/applications" />
        <Row title="יצירת מפגש" href="/manager/events/new" />
        <Row title="שיבוץ ילדים" href="/manager/events/demo/assign" />
        <Row title="גיוס רוכבים" href="/manager/notifications" />
      </div>
    </AppShell>
  );
}
`;
}

function managerReview() {
  return `'use client';

import { AppShell, GhostButton, Panel, PrimaryButton, StatusPill } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="manager" title="סקירת בקשה" subtitle="פרטים רגישים לצוות בלבד.">
      <Panel>
        <StatusPill>UNDER_REVIEW</StatusPill>
        <p className="mt-3 text-sm">כינוי: נועם · גיל 9 · שרון</p>
        <p className="mt-2 rounded-xl bg-ink/5 p-3 text-sm text-asphalt/80">
          סיפור פרטי / הקשר לתמיכה מוצג כאן לצוות בלבד (ChildPrivateData).
        </p>
      </Panel>
      <div className="mt-4 space-y-3">
        <PrimaryButton href="/manager/waiting">אישור</PrimaryButton>
        <GhostButton href="/manager/applications">בקשת מידע נוסף</GhostButton>
        <GhostButton href="/manager/applications">דחייה</GhostButton>
      </div>
    </AppShell>
  );
}
`;
}

function createEvent() {
  return `'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="manager" title="יצירת מפגש" subtitle="מפגש אחד יכול לתמוך בכמה ילדים.">
      <Panel>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="כותרת" defaultValue="Community Ride · שרון" />
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="אזור" />
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" type="datetime-local" />
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="יעד רוכבים" type="number" defaultValue={60} />
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" placeholder="קיבולת ילדים" type="number" defaultValue={12} />
          <PrimaryButton href="/manager/events/demo/ops">שמירת טיוטה</PrimaryButton>
        </form>
      </Panel>
    </AppShell>
  );
}
`;
}

function assignChildren() {
  return `'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="manager" title="שיבוץ ילדים" subtitle="Assignment + Participation lifecycle.">
      <Panel title="מועמדים מאושרים">
        <label className="mb-2 flex items-center justify-between text-sm"><span>נועם · גיל 9</span><input type="checkbox" defaultChecked /></label>
        <label className="mb-2 flex items-center justify-between text-sm"><span>מאיה · גיל 10</span><input type="checkbox" defaultChecked /></label>
        <label className="flex items-center justify-between text-sm"><span>יואב · גיל 8</span><input type="checkbox" /></label>
      </Panel>
      <div className="mt-4"><PrimaryButton href="/manager/events/demo/ops">שיבוץ למפגש</PrimaryButton></div>
    </AppShell>
  );
}
`;
}

function attendance() {
  return `'use client';

import { AppShell, Panel, Row } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="manager" title="נוכחות רוכבים" subtitle="RSVP · CHECKED_IN · NO_SHOW">
      <Panel><p className="text-sm">מאושרים: 18 · בהמתנה: 4 · נכחו: 0</p></Panel>
      <div className="mt-3 space-y-2">
        <Row title="רוכב א׳" meta="CONFIRMED" />
        <Row title="רוכב ב׳" meta="WAITLISTED" />
        <Row title="רוכב ג׳" meta="INTERESTED" />
      </div>
    </AppShell>
  );
}
`;
}

function eventOps() {
  return `'use client';

import { AppShell, GhostButton, Panel, PrimaryButton, StatusPill } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="manager" title="תפעול מפגש" subtitle="פרסום, קיבולת, ביטול/דחייה.">
      <Panel>
        <StatusPill>OPEN_FOR_RIDERS</StatusPill>
        <p className="mt-3 font-semibold">Community Ride · שרון</p>
        <p className="text-sm text-asphalt/70">ילדים משובצים: 9 · רוכבים: 18/60</p>
      </Panel>
      <div className="mt-4 space-y-3">
        <PrimaryButton href="/manager/events/demo/attendance">ניהול נוכחות</PrimaryButton>
        <GhostButton href="/manager/notifications">שלח גיוס רוכבים</GhostButton>
        <GhostButton href="/manager">סמן כמאושר / דחה / בטל</GhostButton>
      </div>
    </AppShell>
  );
}
`;
}

function managerNotifs() {
  return `'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="manager" title="התראות וגיוס" subtitle="קמפיין ממוקד אזור, עם rate limit.">
      <Panel>
        <p className="text-sm text-asphalt/75">״אנחנו צריכים עוד 25 רוכבים למפגש בשרון ביום שבת.״</p>
        <div className="mt-3 space-y-2 text-sm">
          <label className="flex justify-between"><span>שרון</span><input type="checkbox" defaultChecked /></label>
          <label className="flex justify-between"><span>הרצליה</span><input type="checkbox" defaultChecked /></label>
          <label className="flex justify-between"><span>תל אביב</span><input type="checkbox" /></label>
        </div>
        <div className="mt-4"><PrimaryButton>שליחת קמפיין</PrimaryButton></div>
      </Panel>
    </AppShell>
  );
}
`;
}

function adminHome() {
  return `'use client';

import { AppShell, Panel, Row } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="admin" title="לוח מערכת" subtitle="SUPER_ADMIN · platform scope">
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Panel><p className="text-2xl font-bold">1</p><p className="text-xs">Tenants</p></Panel>
        <Panel><p className="text-2xl font-bold">8</p><p className="text-xs">אזורים</p></Panel>
      </div>
      <div className="space-y-2">
        <Row title="משתמשים" href="/admin/users" />
        <Row title="תפקידים והרשאות" href="/admin/roles" />
        <Row title="אזורים וערים" href="/admin/regions" />
        <Row title="יומן ביקורת" href="/admin/audit" />
        <Row title="אנליטיקה" href="/admin/analytics" />
        <Row title="הגדרות" href="/admin/settings" />
      </div>
    </AppShell>
  );
}
`;
}

function permissions() {
  return `'use client';

import { AppShell, Panel } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="admin" title="הרשאות" subtitle="מטריצת RBAC">
      <Panel>
        <ul className="space-y-2 text-sm">
          <li>tenants:manage · SUPER_ADMIN</li>
          <li>applications:review · ADMIN / EVENT_MANAGER</li>
          <li>child_private:read · staff / guardian</li>
          <li>rsvp:manage_own · RIDER</li>
          <li>events:read_public · everyone in tenant</li>
        </ul>
      </Panel>
    </AppShell>
  );
}
`;
}

function regions() {
  return `'use client';

import { AppShell, Row } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="admin" title="אזורים וערים" subtitle="Israel geo hierarchy">
      <div className="space-y-2">
        <Row title="שרון" meta="הרצליה · רמת השרון · נתניה · רעננה" />
        <Row title="תל אביב" meta="תל אביב-יפו · גבעתיים · רמת גן" />
        <Row title="מרכז" meta="פתח תקווה · ראשון לציון · מודיעין" />
        <Row title="צפון / חיפה / ירושלים / שפלה / דרום" meta="מוגדר ב־seed" />
      </div>
    </AppShell>
  );
}
`;
}

function settings() {
  return `'use client';

import { AppShell, Panel, PrimaryButton } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="admin" title="הגדרות מערכת" subtitle="Tenant + platform settings">
      <Panel>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" defaultValue="RideTogether" />
          <input className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2" defaultValue="ride-together" />
          <PrimaryButton>שמירה</PrimaryButton>
        </form>
      </Panel>
    </AppShell>
  );
}
`;
}

function analytics() {
  return `'use client';

import { AppShell, Panel } from '@/components/app-shell';

export default function Page() {
  return (
    <AppShell area="admin" title="אנליטיקה" subtitle="מדדים תפעוליים">
      <div className="grid grid-cols-2 gap-2">
        <Panel><p className="text-2xl font-bold">128</p><p className="text-xs">רוכבים פעילים</p></Panel>
        <Panel><p className="text-2xl font-bold">34</p><p className="text-xs">בקשות החודש</p></Panel>
        <Panel><p className="text-2xl font-bold">6</p><p className="text-xs">מפגשים פתוחים</p></Panel>
        <Panel><p className="text-2xl font-bold">71%</p><p className="text-xs">אישור השתתפות הורים</p></Panel>
      </div>
    </AppShell>
  );
}
`;
}

function escape(s) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

for (const [rel, content] of pages) {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, 'utf8');
  console.log('wrote', rel);
}

console.log(`Generated ${pages.length} screens`);
