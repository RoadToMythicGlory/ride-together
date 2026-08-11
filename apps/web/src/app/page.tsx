'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fadeUp, stagger } from '@/lib/motion';
import { MISSION } from '@/content/mission';

export default function LandingPage() {
  return (
    <main className="bg-bg">
      <section className="relative min-h-[100svh] overflow-hidden">
        <Image
          src="/media/hero-ride.jpg"
          alt=""
          fill
          priority
          className="rt-kenburns object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/55 to-void/20" />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-6 pb-12 pt-8 text-white">
          <div className="mx-auto w-full max-w-lg">
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="space-y-5"
            >
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.35 }}
                className="text-[17px] font-extrabold tracking-tight"
              >
                Ride<span className="text-accent">Together</span>
              </motion.p>
              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="max-w-md text-[38px] font-extrabold leading-[1.08] tracking-tight md:text-[44px]"
              >
                קהילה שמראה
                <br />
                נוכחות
              </motion.h1>
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="max-w-sm text-[15px] leading-relaxed text-white/75"
              >
                לא אפליקציה לילדים. פלטפורמה למבוגרים שבונים שייכות מתמשכת בעולם האמיתי.
              </motion.p>
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-3 pt-2 sm:flex-row"
              >
                <Button href="/register" className="sm:flex-1">
                  הצטרפות
                </Button>
                <Button
                  href="/login"
                  variant="secondary"
                  className="border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/15 sm:flex-1"
                >
                  כניסה
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-lg px-6 py-20">
        <p className="text-sm font-semibold text-accent">המשימה</p>
        <h2 className="mt-3 text-[32px] font-extrabold leading-tight tracking-tight text-ink">
          לא מחווה ליום אחד.
          <br />
          מקום לחזור אליו.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{MISSION.belief}</p>
        <blockquote className="mt-8 border-r-2 border-accent pr-4">
          <p className="text-sm text-muted">במקום:</p>
          <p className="mt-1 font-semibold text-ink">״{MISSION.oldQuestion}״</p>
          <p className="mt-4 text-sm text-muted">אנחנו שואלים:</p>
          <p className="mt-1 font-semibold text-ink">״{MISSION.newQuestion}״</p>
        </blockquote>
        <Link href="/about" className="mt-8 inline-block text-sm font-semibold text-accent">
          לקרוא את כל המשימה
        </Link>
      </section>

      <section className="relative overflow-hidden">
        <div className="relative mx-auto grid min-h-[420px] max-w-5xl md:grid-cols-2">
          <div className="relative min-h-[280px]">
            <Image
              src="/media/community-ride.jpg"
              alt=""
              fill
              className="object-cover object-[28%_center]"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center bg-void px-6 py-12 text-white md:px-10">
            <h2 className="text-[28px] font-extrabold tracking-tight">
              מפגש אחד.
              <br />
              הרבה ילדים.
              <br />
              קהילה אחת.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-white/70">
              הורים מגישים בקשה. מארגנים בונים מפגש. רוכבים מגיעים — וחוזרים. הילדים משתתפים
              בעולם האמיתי, לא באפליקציה.
            </p>
            <Link href="/how-it-works" className="mt-8 text-sm font-semibold text-accent">
              איך זה עובד
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-lg px-6 py-20">
        <h2 className="text-[28px] font-extrabold tracking-tight text-ink">
          כבוד קודם לכול
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          המפגשים נבנים סביב שייכות ונוכחות — לא סביב חשיפת כאב. סיפור אישי נשאר אצל הצוות,
          אלא אם המשפחה בוחרת לשתף אותו. רוכבים מקבלים את מה שנחוץ כדי להגיע.
        </p>
        <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold">
          <Link href="/safety" className="text-accent">
            בטיחות ופרטיות
          </Link>
          <Link href="/about" className="text-ink">
            על המשימה
          </Link>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-10">
        <div className="mx-auto flex max-w-lg flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted">
          <Link href="/privacy">מדיניות פרטיות</Link>
          <Link href="/terms">תנאי שימוש</Link>
          <Link href="/cookies">עוגיות</Link>
          <Link href="/settings">הגדרות חשבון</Link>
          <Link href="/contact">יצירת קשר</Link>
        </div>
        <p className="mx-auto mt-4 max-w-lg text-xs text-muted">
          האפליקציה מיועדת להורים ורוכבים, לא לילדים.
        </p>
      </footer>
    </main>
  );
}