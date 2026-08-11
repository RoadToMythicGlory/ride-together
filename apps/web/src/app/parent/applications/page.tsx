'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { ManifestRow } from '@/components/manifest/manifest-row';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { listMyApplications } from '@/lib/api';

export default function ParentApplicationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { listMyApplications().then(setItems).catch((e) => setError(e.message)); }, []);
  return (
    <AppChrome area="parent" title="הבקשות שלי" subtitle="כל מה שהוגש — במקום אחד.">
      <div className="mb-6">
        <Button href="/parent/applications/new">בקשה חדשה</Button>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {!error && !items.length ? <p className="text-sm text-muted">עדיין לא הוגשו בקשות.</p> : null}
      {items.map((app, i) => <ManifestRow key={app.id} index={i} title={`בקשה עבור ${app.child?.nickname ?? 'ילד'}`} meta={app.status} href={`/parent/applications/${app.id}`} accent={app.status === 'APPROVED' ? 'ink' : 'accent'} />)}
    </AppChrome>
  );
}
