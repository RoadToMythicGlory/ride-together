'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AppChrome } from '@/components/chrome/AppChrome';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { createTenant, listAllTenants, switchTenant, saveSession } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function AdminTenantsPage() {
  const { isSuperAdmin, refresh } = useAuth();
  const [tenants, setTenants] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () =>
    listAllTenants()
      .then(setTenants)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      await createTenant({
        name: String(form.get('name')),
        slug: String(form.get('slug')),
      });
      (e.target as HTMLFormElement).reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה');
    } finally {
      setLoading(false);
    }
  }

  async function onSwitch(tenantId: string) {
    const data = await switchTenant(tenantId);
    saveSession(data);
    await refresh();
    window.location.href = '/admin';
  }

  return (
    <AppChrome area="admin" title="ארגונים" subtitle="Multi-tenant — יצירה, בידוד והחלפה.">
      {!isSuperAdmin ? (
        <p className="text-sm text-muted">רשימת כל הארגונים זמינה ל־SUPER_ADMIN בלבד.</p>
      ) : null}
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

      <div className="space-y-3">
        {tenants.map((t) => (
          <div key={t.id} className="flex items-center justify-between border-b border-line py-3">
            <div>
              <p className="font-bold text-ink">{t.name}</p>
              <p className="text-sm text-muted">
                {t.slug} · {t.members} חברים · {t.events} מפגשים
              </p>
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-accent"
              onClick={() => void onSwitch(t.id)}
            >
              עבור לכאן
            </button>
          </div>
        ))}
      </div>

      {isSuperAdmin ? (
        <form onSubmit={onCreate} className="mt-10 space-y-3 border-t border-line pt-6">
          <p className="text-sm font-semibold text-muted">ארגון חדש</p>
          <Field name="name" label="שם" required placeholder="מועדון צפון" />
          <Field name="slug" label="slug" required placeholder="north-club" />
          <Button type="submit" disabled={loading}>
            {loading ? 'יוצרים…' : 'יצירת ארגון'}
          </Button>
        </form>
      ) : null}
    </AppChrome>
  );
}
