/** Versioned legal copy for store compliance (Apple 5.1.1 / Play Data safety). */
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@ride-together.org';

export const LEGAL = {
  privacyVersion: '2026-08-10',
  termsVersion: '2026-08-10',
  cookiesVersion: '2026-08-10',
  minAge: 18,
  supportEmail: SUPPORT_EMAIL,
  appName: 'RideTogether',
  /** Declared store posture: adult coordinators only — not Kids Category */
  storeAgeRating: '17+',
  notKidsApp: true,
} as const;

export type LegalSection = { heading: string; body: string[] };

export const PRIVACY_HE: LegalSection[] = [
  {
    heading: 'מי אנחנו',
    body: [
      'RideTogether היא פלטפורמה ללא מטרות רווח לתיאום מפגשי תמיכה קהילתיים בישראל בין הורים/אפוטרופוסים, מארגני קהילה ורוכבי אופנועים מבוגרים.',
      'ילדים אינם משתמשי האפליקציה: אין להם חשבון, פרופיל ציבורי, צ׳אט או התחברות.',
    ],
  },
  {
    heading: 'מי קהל היעד',
    body: [
      'האפליקציה מיועדת למבוגרים בני 18 ומעלה בלבד (הורים/אפוטרופוסים, רוכבים, מנהלי אירועים ומנהלי פלטפורמה).',
      'אין להגיש את האפליקציה תחת קטגוריית Kids / Designed for Families.',
    ],
  },
  {
    heading: 'אילו נתונים נאספים',
    body: [
      'חשבון משתמש: שם, אימייל, סיסמה מוצפנת, טלפון (אופציונלי), העדפות שפה ואזורי התראה.',
      'תפקידים ופעילות: הרשמות למפגשים (RSVP), בקשות שהוגשו על ידי הורה, יומן פעולות תפעולי.',
      'נתוני ילד (רק דרך הורה/אפוטרופוס): כינוי תפעולי, גיל/טווח גיל, קטגוריית תמיכה, ופרטים רגישים במאגר פרטי נפרד (שם מלא, הערות רפואיות/נגישות, סיפור פרטי) הנגישים רק לתפקידים מורשים.',
      'מכשירים והתראות (כשיופעלו): מזהה התקן להתראות דחיפה — ללא תוכן מזהה על ילדים בגוף ההודעה.',
    ],
  },
  {
    heading: 'למה אנחנו משתמשים בנתונים',
    body: [
      'תיאום מפגשים בטוחים, אימות זהות משתמשים מבוגרים, שיבוץ משפחות, גיוס רוכבים, תקשורת תפעולית, אבטחה וציות לחוק.',
      'אין מכירת נתונים אישיים. אין פרסום ממוקד מבוסס מעקב פרסומי של ילדים.',
    ],
  },
  {
    heading: 'שיתוף וחשיפה',
    body: [
      'רוכבים מקבלים סיכום ציבורי (אזור, מועד, קיבולת). סיפורים אישיים אינם מפורסמים אלא אם ההורה/אפוטרופוס בחר במפורש לאפשר שיתוף, ובכפוף לתיאום ומודרציה.',
      'מנהלי קהילה מורשים עשויים לראות פרטים פרטיים הנחוצים לבטיחות המפגש.',
      'ספקי תשתית (אחסון, מסד נתונים, שליחת דוא״ל/התראות) מעבדים נתונים לפי הסכמים ובהיקף הנדרש להפעלה.',
    ],
  },
  {
    heading: 'שמירה ומחיקה',
    body: [
      'ניתן לייצא את נתוני החשבון או למחוק את החשבון מתוך האפליקציה (הגדרות → מחיקת חשבון).',
      'במחיקת חשבון: מבוטלים אסימוני גישה, מוסרים מכשירים והעדפות התראה, והחשבון מאונונימיזציה ומושבת.',
      'נתוני ילד רגישים הקשורים להורה שנמחק מנוקים או מאונונימיזציה; רשומות תפעול מינימליות עשויות להישמר לצרכי בטיחות, ביקורת או חובה חוקית לתקופה מוגבלת.',
    ],
  },
  {
    heading: 'זכויותיכם',
    body: [
      `גישה, תיקון, ייצוא ומחיקה של נתוני החשבון דרך האפליקציה או פנייה ל־${LEGAL.supportEmail}.`,
      'הורה/אפוטרופוס רשאי לבקש תיקון או מחיקה של נתוני ילד שהגיש.',
    ],
  },
  {
    heading: 'אבטחה וילדים',
    body: [
      'הפרדה בין נתונים ציבוריים לנתונים פרטיים של ילדים, בקרת הרשאות (RBAC), ורישום פעולות רגישות.',
      'תוכן מדיה (כשיופעל) יישאר פרטי עד מודרציה והסכמה מתאימה — אין פרסום אוטומטי של תמונות ילדים.',
    ],
  },
  {
    heading: 'יצירת קשר',
    body: [
      `לשאלות פרטיות: ${LEGAL.supportEmail} או דרך מסך יצירת קשר באפליקציה.`,
      `גרסת מדיניות זו: ${LEGAL.privacyVersion}.`,
    ],
  },
];

export const TERMS_HE: LegalSection[] = [
  {
    heading: 'קבלה',
    body: [
      'בשימוש ב־RideTogether אתם מאשרים שאתם בני 18 לפחות, ושמדובר בפלטפורמה למבוגרים לתיאום מפגשי קהילה — לא רשת חברתית לילדים.',
    ],
  },
  {
    heading: 'חשבונות ותפקידים',
    body: [
      'מותר חשבון אחד לאדם. ניתן להחזיק יכולות רוכב והורה באותו חשבון.',
      'ילדים אינם נרשמים ואינם מתחברים. כל מידע על ילד מוזן רק על ידי הורה/אפוטרופוס או צוות מורשה.',
    ],
  },
  {
    heading: 'התנהגות ובטיחות',
    body: [
      'משתתפים מתחייבים להתנהגות מכבדת, ציות להנחיות מארגני המפגש ולחוקי התנועה, וללא פרסום פרטים מזהים על ילדים.',
      'הפלטפורמה רשאית להשעות או למחוק חשבונות שפוגעים בבטיחות, בפרטיות או בקהילה.',
    ],
  },
  {
    heading: 'מפגשים ותוכן',
    body: [
      'פרטי מיקום מדויקים עשויים להימסר רק למשתתפים מאושרים. סיכום ציבורי אינו כולל כתובות מגורים. סיפורים אישיים אינם נכללים אלא בהסכמה מפורשת של ההורה.',
      'אין להעלות תוכן פוגעני, לא חוקי, או מזהה ילדים ללא הסכמה ומודרציה.',
    ],
  },
  {
    heading: 'אחריות',
    body: [
      'RideTogether היא פלטפורמת תיאום קהילתית. האחריות להתנהגות במפגש בעולם האמיתי היא על המשתתפים והמארגנים בהתאם לחוק.',
      'השירות מסופק כפי שהוא, בכפוף לשיפורים ושינויים סבירים.',
    ],
  },
  {
    heading: 'מחיקת חשבון',
    body: [
      'ניתן למחוק את החשבון בכל עת דרך הגדרות האפליקציה. לאחר המחיקה הגישה תופסק והנתונים יטופלו לפי מדיניות הפרטיות.',
    ],
  },
  {
    heading: 'יצירת קשר',
    body: [
      LEGAL.supportEmail,
      `גרסת התנאים: ${LEGAL.termsVersion}.`,
    ],
  },
];

export const PRIVACY_EN: LegalSection[] = [
  { heading: 'Information we collect', body: ['We collect adult account details and operational event activity. Child information is submitted only by a parent or guardian and is kept private.'] },
  { heading: 'How we use it', body: ['We use data to coordinate safe community events, verify adult users, communicate operational updates, and meet legal obligations. We do not sell personal data.'] },
  { heading: 'Your choices', body: [`You may request access, correction, export, or deletion of your account data through the app or at ${SUPPORT_EMAIL}.`] },
];

export const TERMS_EN: LegalSection[] = [
  { heading: 'Adult-only service', body: ['RideTogether is for adults aged 18 and over. Children do not create accounts or use the service.'] },
  { heading: 'Safety and conduct', body: ['Participants must act respectfully, follow organizer and traffic-safety instructions, and never publish identifying child information without permission.'] },
  { heading: 'Events and responsibility', body: ['RideTogether coordinates community events; participants and organizers remain responsible for real-world conduct in accordance with applicable law.'] },
];

export const COOKIES_HE: LegalSection[] = [
  {
    heading: 'מה בשימוש',
    body: [
      'האפליקציה משתמשת באחסון מקומי במכשיר (למשל אסימון התחברות) לתפעול החשבון — לא למעקב פרסומי של צד שלישי.',
      'כרגע אין כלי אנליטיקה שיווקיים או פיקסלים של רשתות חברתיות. אם יתווספו בעתיד, נעדכן מדיניות זו ונבקש הסכמה היכן שנדרש.',
    ],
  },
  {
    heading: 'שליטה',
    body: [
      'ניתן להתנתק כדי למחוק אסימוני גישה מהמכשיר, ולמחוק את החשבון דרך ההגדרות.',
      `גרסה: ${LEGAL.cookiesVersion}.`,
    ],
  },
];
