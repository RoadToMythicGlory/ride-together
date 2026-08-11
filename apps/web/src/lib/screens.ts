export type ScreenDef = {
  href: string;
  title: string;
  blurb: string;
  group:
    | 'public'
    | 'auth'
    | 'onboarding'
    | 'rider'
    | 'parent'
    | 'manager'
    | 'admin';
};

export const SCREENS: ScreenDef[] = [
  // Public
  { href: '/', title: 'דף נחיתה', blurb: 'המסר של הקהילה והקריאה לפעולה.', group: 'public' },
  { href: '/about', title: 'על המשימה', blurb: 'קהילה שמראה נוכחות.', group: 'public' },
  { href: '/how-it-works', title: 'איך זה עובד', blurb: 'הורה → בקשה → מפגש → רוכבים.', group: 'public' },
  { href: '/safety', title: 'בטיחות ופרטיות', blurb: 'ילדים אינם משתמשי המערכת.', group: 'public' },
  { href: '/contact', title: 'יצירת קשר', blurb: 'פנייה לצוות הקהילה.', group: 'public' },
  { href: '/privacy', title: 'מדיניות פרטיות', blurb: 'חובת חנות — איסוף ומחיקת נתונים.', group: 'public' },
  { href: '/terms', title: 'תנאי שימוש', blurb: 'כללים למבוגרים 18+.', group: 'public' },
  { href: '/cookies', title: 'עוגיות', blurb: 'אחסון מקומי להתחברות.', group: 'public' },
  { href: '/settings', title: 'הגדרות חשבון', blurb: 'פרטיות, ייצוא, מחיקה.', group: 'public' },
  { href: '/settings/export', title: 'ייצוא נתונים', blurb: 'הורדת עותק JSON.', group: 'public' },
  { href: '/settings/delete', title: 'מחיקת חשבון', blurb: 'App Store 5.1.1(v).', group: 'public' },

  // Auth
  { href: '/login', title: 'כניסה', blurb: 'התחברות לחשבון.', group: 'auth' },
  { href: '/register', title: 'הרשמה', blurb: '18+ + אישור תנאים ופרטיות.', group: 'auth' },
  { href: '/forgot-password', title: 'שחזור סיסמה', blurb: 'איפוס גישה לחשבון.', group: 'auth' },
  { href: '/reset-password?token=example', title: 'איפוס סיסמה', blurb: 'בחירת סיסמה חדשה מקישור איפוס.', group: 'auth' },
  { href: '/verify-email?token=example', title: 'אימות אימייל', blurb: 'אימות כתובת המייל מהקישור שנשלח.', group: 'auth' },

  // Onboarding
  { href: '/onboarding', title: 'בחירת תפקיד', blurb: 'רוכב, הורה, או שניהם.', group: 'onboarding' },
  { href: '/onboarding/rider', title: 'השלמת פרופיל רוכב', blurb: 'עיר, אזורי התראה, אופנוע.', group: 'onboarding' },
  { href: '/onboarding/parent', title: 'השלמת פרופיל הורה', blurb: 'פרטי קשר ואישור פרטיות.', group: 'onboarding' },

  // Rider
  { href: '/rider', title: 'בית רוכב', blurb: 'מפגשים קרובים ופעולה מהירה.', group: 'rider' },
  { href: '/rider/events', title: 'מפגשים באזור', blurb: 'גילוי מפגשים לפי העדפות גיאוגרפיות.', group: 'rider' },
  { href: '/rider/events/demo', title: 'פרטי מפגש', blurb: 'על המפגש, למי מיועד, RSVP.', group: 'rider' },
  { href: '/rider/events/example-id', title: 'פרטי מפגש חי', blurb: 'פירוט מפגש ואישור השתתפות.', group: 'rider' },
  { href: '/rider/upcoming', title: 'המפגשים שלי', blurb: 'RSVP מאושרים וממתינים.', group: 'rider' },
  { href: '/rider/history', title: 'היסטוריית השתתפות', blurb: 'מפגשים קודמים.', group: 'rider' },
  { href: '/rider/notifications', title: 'העדפות התראות', blurb: 'ערים ואזורים לקבלת עדכונים.', group: 'rider' },
  { href: '/rider/profile', title: 'פרופיל רוכב', blurb: 'פרטים אישיים ואופנוע.', group: 'rider' },

  // Parent
  { href: '/parent', title: 'בית הורה', blurb: 'סטטוס בקשות ועדכונים.', group: 'parent' },
  { href: '/parent/applications/new', title: 'הגשת בקשה', blurb: 'בקשה למפגש קהילתי עבור ילד.', group: 'parent' },
  { href: '/parent/applications', title: 'הבקשות שלי', blurb: 'כל הבקשות שהוגשו.', group: 'parent' },
  { href: '/parent/applications/demo', title: 'סטטוס בקשה', blurb: 'מעקב אחרי תהליך האישור.', group: 'parent' },
  { href: '/parent/applications/example-id', title: 'פרטי בקשה', blurb: 'סטטוס ופרטי בקשה שהוגשה.', group: 'parent' },
  { href: '/parent/applications/demo/more-info', title: 'השלמת מידע', blurb: 'מענה לבקשת מידע נוסף.', group: 'parent' },
  { href: '/parent/event', title: 'מפגש ששובץ', blurb: 'פרטי המפגש עבור הילד.', group: 'parent' },
  { href: '/parent/confirm', title: 'אישור השתתפות', blurb: 'אישור או דחיית הגעה.', group: 'parent' },
  { href: '/parent/consents', title: 'ניהול הסכמות', blurb: 'הסכמות פרטיות, צילום ועוד.', group: 'parent' },

  // Manager
  { href: '/manager', title: 'לוח מארגן', blurb: 'תמונת מצב תפעולית.', group: 'manager' },
  { href: '/manager/applications', title: 'בקשות ממתינות', blurb: 'תור לבדיקה ואישור.', group: 'manager' },
  { href: '/manager/applications/demo', title: 'סקירת בקשה', blurb: 'אישור / דחייה / מידע נוסף.', group: 'manager' },
  { href: '/manager/applications/example-id', title: 'סקירת בקשה חיה', blurb: 'החלטה ושיבוץ לבקשה.', group: 'manager' },
  { href: '/manager/waiting', title: 'ילדים מאושרים בהמתנה', blurb: 'מוכנים לשיבוץ למפגש.', group: 'manager' },
  { href: '/manager/events/new', title: 'יצירת מפגש', blurb: 'תכנון מפגש קהילתי.', group: 'manager' },
  { href: '/manager/events/demo/assign', title: 'שיבוץ ילדים', blurb: 'שיוך בקשות מאושרות למפגש.', group: 'manager' },
  { href: '/manager/events/demo/attendance', title: 'נוכחות רוכבים', blurb: 'RSVP וצ׳ק־אין.', group: 'manager' },
  { href: '/manager/events/demo/ops', title: 'תפעול מפגש', blurb: 'פרסום, קיבולת, ביטול.', group: 'manager' },
  { href: '/manager/notifications', title: 'התראות וגיוס', blurb: 'קמפיינים לאזורי רכיבה.', group: 'manager' },
  { href: '/manager/history', title: 'היסטוריית מפגשים', blurb: 'מפגשים שהסתיימו.', group: 'manager' },

  // Admin
  { href: '/admin', title: 'לוח מערכת', blurb: 'סקירה רוחבית של הפלטפורמה.', group: 'admin' },
  { href: '/admin/tenants', title: 'ארגונים (Tenants)', blurb: 'ניהול דיירים בפלטפורמה.', group: 'admin' },
  { href: '/admin/users', title: 'משתמשים', blurb: 'חשבונות, השעיה, חברות.', group: 'admin' },
  { href: '/admin/roles', title: 'תפקידים', blurb: 'תפקידים ברמת ארגון.', group: 'admin' },
  { href: '/admin/permissions', title: 'הרשאות', blurb: 'מטריצת הרשאות.', group: 'admin' },
  { href: '/admin/moderation', title: 'מודרציה', blurb: 'תוכן ומדיה לאישור.', group: 'admin' },
  { href: '/admin/regions', title: 'אזורים וערים', blurb: 'מבנה גיאוגרפי לישראל.', group: 'admin' },
  { href: '/admin/audit', title: 'יומן ביקורת', blurb: 'פעולות רגישות.', group: 'admin' },
  { href: '/admin/settings', title: 'הגדרות מערכת', blurb: 'קונפיגורציה כללית.', group: 'admin' },
  { href: '/admin/analytics', title: 'אנליטיקה', blurb: 'מדדים תפעוליים.', group: 'admin' },
];

export const GROUP_LABELS: Record<ScreenDef['group'], string> = {
  public: 'ציבורי',
  auth: 'התחברות',
  onboarding: 'הצטרפות',
  rider: 'רוכב',
  parent: 'הורה',
  manager: 'מארגן',
  admin: 'אדמין',
};
