'use client';

import { AppChrome } from '@/components/chrome/AppChrome';
import { ManifestRow } from '@/components/manifest/manifest-row';
import { useEffect, useState } from 'react';
import { listApplicationQueue } from '@/lib/api';

export default function ManagerApplicationsPage() {
  const [queue, setQueue] = useState<any[]>([]); const [error, setError] = useState('');
  useEffect(() => { listApplicationQueue().then(setQueue).catch((e) => setError(e.message)); }, []);
  return (
    <AppChrome area="manager" title="תור בקשות" subtitle="דורשות עיניים אנושיות.">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">פתוחות עכשיו</p>
        <span className="text-sm tabular-nums text-muted">{queue.length}</span>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {!error && !queue.length ? <p className="text-sm text-muted">אין בקשות פתוחות.</p> : null}
      {queue.map((q, i) => (
        <ManifestRow
          key={q.id}
          index={i}
          title={`בקשה #${q.id.slice(-6)} · ${q.child?.nickname ?? ''}`}
          meta={q.status}
          href={`/manager/applications/view?id=${q.id}`}
          accent="accent"
        />
      ))}
    </AppChrome>
  );
}
