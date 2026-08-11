'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MISSION } from '@/content/mission';

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-12">
      <h2 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-lg items-center justify-between px-5 py-5">
        <Link href="/" className="text-[15px] font-extrabold tracking-tight text-ink">
          RideTogether
        </Link>
        <Link href="/login" className="text-sm font-semibold text-accent">
          כניסה
        </Link>
      </header>

      <div className="relative h-[280px] w-full overflow-hidden">
        <Image
          src="/media/hero-ride.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-void/50 to-void/35" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-lg px-5 pb-8">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-accent"
          >
            על המשימה
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-2 text-[34px] font-extrabold leading-[1.1] tracking-tight text-ink"
          >
            {MISSION.headline}
          </motion.h1>
        </div>
      </div>

      <article className="mx-auto max-w-lg px-5 pb-20">
        <p className="mt-8 text-[16px] leading-relaxed text-ink">{MISSION.intro}</p>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{MISSION.belief}</p>
        <p className="mt-4 text-[15px] font-medium leading-relaxed text-ink">
          {MISSION.principle}
        </p>

        <Section title="לא עוד ביקור חד־פעמי">
          <p>
            ברחבי ישראל קיימות עשרות קבוצות של רוכבי אופנועים שמתארגנות בהתנדבות כדי לשמח ילדים.
            פעם אחר פעם מגיעים עשרות רוכבים ליום הולדת של ילד שעבר חרם, לילדה שמתמודדת עם מחלה, או
            לילד שחווה תקופה קשה.
          </p>
          <p>אלו רגעים עוצמתיים. אבל לאחר שהאירוע מסתיים, כולם חוזרים הביתה.</p>
          <p>
            RideTogether נולדה מתוך הרצון לקחת את אותה רוח קהילתית ולהפוך אותה למשהו שנמשך לאורך
            זמן.
          </p>
          <blockquote className="border-r-2 border-accent pr-4 text-ink">
            <p className="text-sm text-muted">במקום לשאול:</p>
            <p className="mt-1 font-semibold">״{MISSION.oldQuestion}״</p>
            <p className="mt-4 text-sm text-muted">אנחנו רוצים לשאול:</p>
            <p className="mt-1 font-semibold">״{MISSION.newQuestion}״</p>
          </blockquote>
        </Section>

        <Section title="הילדים אינם המשתמשים של האפליקציה">
          <p>זוהי נקודת היסוד של המערכת. RideTogether אינה רשת חברתית לילדים.</p>
          <p>לילדים אין חשבון משתמש, פרופיל אישי, מערכת הודעות, רשימת חברים, או אפשרות ליצור קשר עם מבוגרים דרך הפלטפורמה.</p>
          <p className="font-medium text-ink">
            הילדים אינם משתמשים באפליקציה כלל. הם משתתפים במפגשים בעולם האמיתי. הפלטפורמה קיימת
            עבור המבוגרים שמאפשרים לזה לקרות.
          </p>
        </Section>

        <Section title="מי כן משתמש באפליקציה?">
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-ink">הורים ואפוטרופוסים</h3>
              <p className="mt-2">
                מגישים בקשה עבור ילדיהם, משתפים את הסיפור עם הצוות, ויכולים לבחור אם לשתף אותו
                גם בקהילה. עוקבים אחר סטטוס, מאשרים השתתפות ומעדכנים מידע במידת הצורך.
              </p>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-ink">רוכבי אופנועים</h3>
              <p className="mt-2">
                בוחרים אזורי התראה, מקבלים עדכונים על מפגשים, נרשמים ומגיעים להיות חלק מהקהילה.
                רוכב שהוא גם הורה יכול להשתמש באותו חשבון לשני התפקידים.
              </p>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-ink">מנהלי קהילה</h3>
              <p className="mt-2">
                בודקים בקשות, מאמתים מידע, בונים מפגשים, משבצים ילדים, מגייסים רוכבים ודואגים
                שהכול יתנהל בצורה בטוחה, מכבדת ומסודרת.
              </p>
            </div>
          </div>
        </Section>

        <Section title="מפגש אחד. הרבה ילדים. קהילה אחת.">
          <p>
            במקום אירוע עבור ילד אחד בלבד, RideTogether מעודדת מפגשים קהילתיים שבהם משתתפים מספר
            ילדים יחד — כך נוצרת הזדמנות אמיתית לחיבורים חדשים.
          </p>
          <p>
            הרוכבים לא מגיעים רק כדי ״לעשות שמח״ — הם הופכים לפנים מוכרות שחוזרות שוב ושוב. לאורך
            הזמן נבנית קהילה.
          </p>
        </Section>

        <Section title="כבוד ושייכות">
          <p>
            אנחנו בונים מפגשים סביב נוכחות מכבדת והמשכיות — לא סביב חשיפת כאב. כברירת מחדל
            רוכבים לא רואים את הסיפור המלא, אלא אם המשפחה בחרה לשתף אותו. מה שהם כן יודעים:
            יש מפגש שבו מחכים להם ילדים שזקוקים לנוכחות.
          </p>
        </Section>

        <Section title="פרטיות ובטיחות לפני הכול">
          <p>
            המידע האישי של הילדים נשמר ברמת אבטחה גבוהה. רק מנהלי קהילה מורשים יכולים לצפות במידע
            המלא. רוכבים מקבלים רק את המידע הדרוש להשתתפות.
          </p>
          <p>
            אין חשיפה של כתובות מגורים, בתי ספר או מידע רפואי רגיש, אלא אם קיימת הסכמה מפורשת
            והמידע הכרחי לבטיחות האירוע.
          </p>
          <Link href="/safety" className="inline-block font-semibold text-accent">
            עוד על בטיחות ופרטיות
          </Link>
        </Section>

        <Section title="נוכחות משנה חיים">
          <p>
            לפעמים מה שילד באמת צריך הוא לדעת שמישהו הגיע. שהקדיש את הזמן שלו. שבחר להיות שם.
          </p>
          <p>
            עשרות אופנועים שנכנסים יחד, מנועים שנדלקים, חיוכים, שיחות, תמונות, חיבוקים ואנשים
            שחוזרים שוב — זו שפה שילדים מבינים היטב. זו שפה של נוכחות.
          </p>
        </Section>

        <Section title="החזון">
          <p className="text-ink">{MISSION.vision}</p>
        </Section>

        <div className="mt-10 space-y-3">
          <Button href="/register">הצטרפות לקהילה</Button>
          <Button href="/how-it-works" variant="secondary">
            איך זה עובד בפועל
          </Button>
        </div>
      </article>
    </main>
  );
}
