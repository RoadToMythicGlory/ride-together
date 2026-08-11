'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AppChrome } from '@/components/chrome/AppChrome';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { addTenantMember, listTenantMembers, setTenantMemberRoles } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const ROLE_OPTS = ['ADMIN', 'EVENT_MANAGER', 'RIDER', 'PARENT'] as const;

export default function AdminUsersPage() {
  const { me } = useAuth();
  const tenantId = me?.activeTenant?.id;
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<string[]>(['RIDER']);

  const load = () => {
    if (!tenantId) return;
    listTenantMembers(tenantId)
      .then(setMembers)
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, [tenantId]);

  async function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tenantId) return;
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      await addTenantMember(tenantId, {
        email: String(form.get('email')),
        roles,
      });
      (e.target as HTMLFormElement).reset();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה');
    }
  }

  return (
    <AppChrome
      area="admin"
      title="משתמשים"
      subtitle={`חברי הארגון הפעיל: ${me?.activeTenant?.name ?? ''}`}
    >
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.userId} className="border-b border-line py-3">
            <p className="font-bold text-ink">{m.fullName}</p>
            <p className="text-sm text-muted">{m.email}</p>
            <p className="mt-1 text-xs text-muted">
              {m.roles.join(' · ')} · {m.status}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROLE_OPTS.map((r) => {
                const on = m.roles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    className={`px-2 py-1 text-xs font-semibold ${on ? 'bg-accent text-white' : 'border border-line text-muted'}`}
                    onClick={() => {
                      if (!tenantId) return;
                      const next = on ? m.roles.filter((x: string) => x !== r) : [...m.roles, r];
                      void setTenantMemberRoles(tenantId, m.userId, {
                        roles: next.length ? next : ['RIDER'],
                      }).then(load);
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onAdd} className="mt-10 space-y-3 border-t border-line pt-6">
        <p className="text-sm font-semibold text-muted">הוספת חבר קיים (לפי אימייל)</p>
        <Field name="email" type="email" label="אימייל" required />
        <div className="flex flex-wrap gap-2">
          {ROLE_OPTS.map((r) => (
            <button
              key={r}
              type="button"
              className={`px-2 py-1 text-xs font-semibold ${roles.includes(r) ? 'bg-accent text-white' : 'border border-line text-muted'}`}
              onClick={() =>
                setRoles((prev) =>
                  prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
                )
              }
            >
              {r}
            </button>
          ))}
        </div>
        <Button type="submit">הוספה לארגון</Button>
      </form>
    </AppChrome>
  );
}
