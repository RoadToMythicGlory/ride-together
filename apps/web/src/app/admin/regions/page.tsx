'use client';

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
