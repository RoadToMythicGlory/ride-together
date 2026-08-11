'use client';

import { useState } from 'react';
import { AppChrome } from '@/components/chrome/AppChrome';
import { Button } from '@/components/ui/button';
import { exportMyData } from '@/lib/api';

export default function ExportDataPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onExport() {
    setError(null);
    setLoading(true);
    try {
      const data = await exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ridetogether-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בייצוא');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppChrome
      area="public"
      title="ייצוא נתונים"
      subtitle="הורדת עותק של נתוני החשבון שלכם — כולל הסכמות ובקשות שהוגשו."
    >
      <p className="text-[15px] leading-relaxed text-muted">
        הקובץ כולל פרטי חשבון, אזורי התראה, הסכמות, RSVP, ובמידת הצורך נתוני ילד שאתם אפוטרופוסים
        עליהם. אין לכלול בקובץ זה פרטים של משתמשים אחרים.
      </p>
      <div className="mt-6">
        <Button type="button" onClick={onExport} disabled={loading}>
          {loading ? 'מייצאים…' : 'הורדת JSON'}
        </Button>
      </div>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      <p className="mt-8">
        <Button href="/settings" variant="secondary">
          חזרה להגדרות
        </Button>
      </p>
    </AppChrome>
  );
}
