'use client';

import { useEffect, useState } from 'react';
import { AppChrome } from '@/components/chrome/AppChrome';
import { listPermissionsCatalog, listRoles, setRolePermissions } from '@/lib/api';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([listRoles(), listPermissionsCatalog()])
      .then(([r, p]) => {
        setRoles(r);
        setCatalog(p);
        if (!active && r[0]) {
          setActive(r[0].key);
          setSelected(r[0].permissions);
        }
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const role = roles.find((r) => r.key === active);
    if (role) setSelected(role.permissions);
  }, [active, roles]);

  async function save() {
    if (!active) return;
    setSaving(true);
    setError('');
    try {
      await setRolePermissions(active, selected);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'שגיאה');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppChrome area="admin" title="תפקידים" subtitle="הרשאות מתוך מסד הנתונים — לפי ארגון פעיל.">
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        {roles.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setActive(r.key)}
            className={`px-3 py-2 text-sm font-semibold ${active === r.key ? 'bg-void text-white' : 'border border-line text-muted'}`}
          >
            {r.key}
          </button>
        ))}
      </div>

      {active ? (
        <div className="mt-6">
          <p className="text-sm text-muted">
            {active} · {selected.length} הרשאות
          </p>
          <ul className="mt-4 max-h-[50vh] space-y-2 overflow-auto">
            {catalog.map((p) => {
              const on = selected.includes(p.key);
              return (
                <li key={p.key}>
                  <label className="flex items-center justify-between gap-3 py-1 text-sm">
                    <span className="font-medium text-ink">{p.key}</span>
                    <input
                      type="checkbox"
                      checked={on}
                      className="h-4 w-4 accent-[var(--accent)]"
                      onChange={() =>
                        setSelected((prev) =>
                          on ? prev.filter((x) => x !== p.key) : [...prev, p.key],
                        )
                      }
                    />
                  </label>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="mt-6 w-full bg-accent py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'שומרים…' : 'שמירת הרשאות לתפקיד'}
          </button>
          <p className="mt-3 text-xs text-muted">
            שינוי נכנס לתוקף בבקשות הבאות (JWT חדש / רענון).
          </p>
        </div>
      ) : null}
    </AppChrome>
  );
}
