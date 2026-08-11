/**
 * Light-touch sweep: ensure remaining generated screens don't rely on
 * card-looking wrappers in class strings. Most styling comes from AppShell bridge.
 * This script rewrites a few high-traffic leftovers for denser list chrome.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'app');

const targets = [
  'rider/events/page.tsx',
  'rider/upcoming/page.tsx',
  'rider/history/page.tsx',
  'rider/notifications/page.tsx',
  'rider/profile/page.tsx',
  'parent/applications/page.tsx',
  'parent/applications/demo/page.tsx',
  'parent/event/page.tsx',
  'parent/confirm/page.tsx',
  'parent/consents/page.tsx',
  'manager/applications/page.tsx',
  'manager/waiting/page.tsx',
  'manager/events/new/page.tsx',
  'manager/events/demo/assign/page.tsx',
  'manager/events/demo/attendance/page.tsx',
  'manager/events/demo/ops/page.tsx',
  'manager/notifications/page.tsx',
  'manager/history/page.tsx',
  'admin/users/page.tsx',
  'admin/roles/page.tsx',
  'admin/regions/page.tsx',
  'admin/audit/page.tsx',
  'admin/analytics/page.tsx',
  'admin/settings/page.tsx',
  'admin/tenants/page.tsx',
  'admin/permissions/page.tsx',
  'admin/moderation/page.tsx',
  'onboarding/rider/page.tsx',
  'onboarding/parent/page.tsx',
  'parent/applications/demo/more-info/page.tsx',
  'manager/applications/demo/page.tsx',
];

let touched = 0;
for (const rel of targets) {
  const full = join(root, rel);
  if (!existsSync(full)) continue;
  let src = readFileSync(full, 'utf8');
  const before = src;
  src = src.replaceAll('rounded-xl border border-ink/15 bg-white/80', 'rounded-md border border-line bg-surface');
  src = src.replaceAll('rounded-2xl border border-ink/10 bg-white/55 p-4 shadow-sm', '');
  src = src.replaceAll('bg-ink/5', 'bg-bg');
  src = src.replaceAll('text-signal', 'text-accent');
  src = src.replaceAll('text-asphalt/70', 'text-muted');
  src = src.replaceAll('text-asphalt/75', 'text-muted');
  src = src.replaceAll('text-asphalt/60', 'text-muted');
  if (src !== before) {
    writeFileSync(full, src);
    touched += 1;
    console.log('updated', rel);
  }
}
console.log(`touched ${touched}/${targets.length}`);
