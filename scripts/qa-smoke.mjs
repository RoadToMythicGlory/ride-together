/**
 * Live QA smoke tests against running API (:3001) and Web (:3000).
 * Exit code 1 if any assertion fails.
 */

const API = process.env.API_URL ?? 'http://localhost:3001/api';
const WEB = process.env.WEB_URL ?? 'http://localhost:3000';

const WEB_ROUTES = [
  '/',
  '/about',
  '/how-it-works',
  '/safety',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  '/settings',
  '/settings/export',
  '/settings/delete',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/privacy/en',
  '/terms/en',
  '/onboarding',
  '/onboarding/rider',
  '/onboarding/parent',
  '/home',
  '/emulator',
  '/rider',
  '/rider/events',
  '/rider/events/demo',
  '/rider/upcoming',
  '/rider/history',
  '/rider/notifications',
  '/rider/profile',
  '/parent',
  '/parent/applications',
  '/parent/applications/new',
  '/parent/applications/demo',
  '/parent/applications/demo/more-info',
  '/parent/event',
  '/parent/confirm',
  '/parent/consents',
  '/manager',
  '/manager/applications',
  '/manager/applications/demo',
  '/manager/waiting',
  '/manager/events/new',
  '/manager/events/demo/assign',
  '/manager/events/demo/attendance',
  '/manager/events/demo/ops',
  '/manager/notifications',
  '/manager/history',
  '/admin',
  '/admin/tenants',
  '/admin/users',
  '/admin/roles',
  '/admin/permissions',
  '/admin/moderation',
  '/admin/regions',
  '/admin/audit',
  '/admin/settings',
  '/admin/analytics',
];

let passed = 0;
let failed = 0;

function ok(name, detail = '') {
  passed += 1;
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  failed += 1;
  console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
}

async function req(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { res, text, json };
}

async function section(title, fn) {
  console.log(`\n== ${title} ==`);
  await fn();
}

await section('Infrastructure', async () => {
  try {
    const { res, json } = await req(`${API}/health`);
    if (res.ok && json?.ok) ok('API health', json.service);
    else fail('API health', `status ${res.status}`);
  } catch (e) {
    fail('API health', e.message);
  }

  try {
    const { res } = await req(WEB);
    if (res.ok) ok('Web landing', String(res.status));
    else fail('Web landing', String(res.status));
  } catch (e) {
    fail('Web landing', e.message);
  }
});

let accessToken = null;
let refreshToken = null;

await section('Auth — admin login', async () => {
  const { res, json } = await req(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@ride-together.local',
      password: 'ChangeMe123!',
    }),
  });
  if (!res.ok) {
    fail('admin login', JSON.stringify(json ?? res.status));
    return;
  }
  if (!json.accessToken || !json.refreshToken) {
    fail('admin login tokens missing');
    return;
  }
  accessToken = json.accessToken;
  refreshToken = json.refreshToken;
  ok('admin login', json.user?.email);
  if (json.tenant?.slug === 'ride-together') ok('default tenant slug', json.tenant.slug);
  else fail('default tenant slug', json.tenant?.slug);
});

await section('Auth — /me + roles', async () => {
  if (!accessToken) {
    fail('/me skipped', 'no token');
    return;
  }
  const { res, json } = await req(`${API}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    fail('GET /me', String(res.status));
    return;
  }
  ok('GET /me', json.email);
  if (json.platformRoles?.includes('SUPER_ADMIN')) ok('platform SUPER_ADMIN present');
  else fail('platform SUPER_ADMIN present', JSON.stringify(json.platformRoles));
  if (json.tenantRoles?.includes('ADMIN')) ok('tenant ADMIN present');
  else fail('tenant ADMIN present', JSON.stringify(json.tenantRoles));
  if (json.activeTenant?.slug === 'ride-together') ok('active tenant', json.activeTenant.slug);
  else fail('active tenant', json.activeTenant?.slug);
});

await section('Auth — refresh rotation', async () => {
  if (!refreshToken) {
    fail('refresh skipped', 'no refresh token');
    return;
  }
  const { res, json } = await req(`${API}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok || !json.accessToken) {
    fail('refresh token', JSON.stringify(json ?? res.status));
    return;
  }
  accessToken = json.accessToken;
  refreshToken = json.refreshToken;
  ok('refresh issues new tokens');
});

await section('Auth — bad credentials', async () => {
  const { res } = await req(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@ride-together.local',
      password: 'wrong-password',
    }),
  });
  if (res.status === 401) ok('rejects bad password', '401');
  else fail('rejects bad password', `got ${res.status}`);
});

await section('Auth — unauthorized /me', async () => {
  const { res } = await req(`${API}/me`);
  if (res.status === 401) ok('GET /me without token → 401');
  else fail('GET /me without token', `got ${res.status}`);
});

await section('Geography', async () => {
  const { res, json } = await req(`${API}/regions`);
  if (!res.ok || !Array.isArray(json)) {
    fail('GET /regions', String(res.status));
    return;
  }
  ok('GET /regions', `${json.length} regions`);
  if (json.length >= 8) ok('Israel regions seeded (≥8)');
  else fail('Israel regions seeded (≥8)', String(json.length));

  const sharon = json.find((r) => r.key === 'sharon');
  if (sharon?.cities?.length) ok('Sharon has cities', String(sharon.cities.length));
  else fail('Sharon has cities');

  if (!accessToken || !sharon) return;

  const cityId = sharon.cities[0].id;
  const telAviv = json.find((r) => r.key === 'tel-aviv');
  const regionId = telAviv?.id;

  const put = await req(`${API}/me/notification-regions`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ cityId }, ...(regionId ? [{ regionId }] : [])],
    }),
  });
  if (!put.res.ok) {
    fail('PUT notification-regions', JSON.stringify(put.json));
    return;
  }
  const items = Array.isArray(put.json) ? put.json : put.json?.value ?? [];
  const hasCity = items.some((i) => i.cityId === cityId);
  const hasRegion = regionId ? items.some((i) => i.regionId === regionId) : true;
  if (hasCity && hasRegion) ok('city XOR region subscriptions saved', `${items.length} rows`);
  else fail('city XOR region subscriptions saved', JSON.stringify(items));

  const both = await req(`${API}/me/notification-regions`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: [{ cityId, regionId }] }),
  });
  if (both.res.status >= 400) ok('rejects city+region together', String(both.res.status));
  else fail('rejects city+region together', 'accepted invalid payload');
});

await section('Auth — register rider+parent', async () => {
  const email = `qa.rider.parent.${Date.now()}@example.com`;
  const { res, json } = await req(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Password123!',
      fullName: 'QA Rider Parent',
      capabilities: ['RIDER', 'PARENT'],
      ageAttested18: true,
      acceptedTerms: true,
      acceptedPrivacy: true,
    }),
  });
  if (!res.ok) {
    fail('register both capabilities', JSON.stringify(json));
    return;
  }
  ok('register both capabilities', email);

  const me = await req(`${API}/me`, {
    headers: { Authorization: `Bearer ${json.accessToken}` },
  });
  if (
    me.json?.capabilities?.rider &&
    me.json?.capabilities?.parent &&
    me.json?.tenantRoles?.includes('RIDER') &&
    me.json?.tenantRoles?.includes('PARENT')
  ) {
    ok('composable RIDER+PARENT roles on /me');
  } else {
    fail('composable RIDER+PARENT roles on /me', JSON.stringify(me.json?.tenantRoles));
  }

  const consents = me.json?.consents ?? [];
  const types = consents.map((c) => c.consentType);
  if (
    types.includes('AGE_ATTESTATION_18') &&
    types.includes('TERMS_OF_SERVICE') &&
    types.includes('PRIVACY_POLICY')
  ) {
    ok('signup consents persisted');
  } else {
    fail('signup consents persisted', JSON.stringify(types));
  }
});

await section('Store compliance — export + delete account', async () => {
  const email = `qa.delete.${Date.now()}@example.com`;
  const reg = await req(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Password123!',
      fullName: 'QA Delete Me',
      capabilities: ['RIDER'],
      ageAttested18: true,
      acceptedTerms: true,
      acceptedPrivacy: true,
    }),
  });
  if (!reg.res.ok) {
    fail('register disposable user for delete', JSON.stringify(reg.json));
    return;
  }
  const token = reg.json.accessToken;

  const exp = await req(`${API}/me/export`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (exp.res.ok && exp.json?.account?.email === email) ok('GET /me/export');
  else fail('GET /me/export', JSON.stringify(exp.json));

  const bad = await req(`${API}/me`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ confirmation: 'NOPE' }),
  });
  if (bad.res.status >= 400) ok('delete rejects bad confirmation');
  else fail('delete rejects bad confirmation', String(bad.res.status));

  const del = await req(`${API}/me`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ confirmation: 'DELETE' }),
  });
  if (del.res.ok && del.json?.deleted) ok('DELETE /me account');
  else fail('DELETE /me account', JSON.stringify(del.json));

  const loginAfter = await req(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Password123!' }),
  });
  if (loginAfter.res.status === 401) ok('deleted account cannot login');
  else fail('deleted account cannot login', String(loginAfter.res.status));
});

await section('Store compliance — register without age/terms', async () => {
  const { res } = await req(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `qa.no.terms.${Date.now()}@example.com`,
      password: 'Password123!',
      fullName: 'No Terms',
      capabilities: ['RIDER'],
    }),
  });
  if (res.status >= 400) ok('register requires age/terms/privacy');
  else fail('register requires age/terms/privacy', 'accepted incomplete signup');
});

await section('Auth — patch /me', async () => {
  if (!accessToken) return;
  const { res, json } = await req(`${API}/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fullName: 'Platform Admin', locale: 'he' }),
  });
  if (res.ok && json.locale === 'he') ok('PATCH /me');
  else fail('PATCH /me', JSON.stringify(json));
});

await section('Web — all product screens', async () => {
  for (const path of WEB_ROUTES) {
    try {
      const { res, text } = await req(`${WEB}${path}`);
      if (!res.ok) {
        fail(`WEB ${path}`, `status ${res.status}`);
        continue;
      }
      if (!text || text.length < 50) {
        fail(`WEB ${path}`, 'empty/short body');
        continue;
      }
      if (text.includes('Application error') || text.includes('Internal Server Error')) {
        fail(`WEB ${path}`, 'error content in HTML');
        continue;
      }
      ok(`WEB ${path}`);
    } catch (e) {
      fail(`WEB ${path}`, e.message);
    }
  }
});

await section('Web — mission content present', async () => {
  const about = await req(`${WEB}/about`);
  const cue = about.text.includes('לא אפליקציה לילדים') || about.text.includes('קהילה שמראה');
  if (about.res.ok && cue) ok('about page contains mission cue');
  else fail('about page contains mission cue');

  const landing = await req(`${WEB}/`);
  if (landing.res.ok && landing.text.includes('RideTogether')) ok('landing contains brand');
  else fail('landing contains brand');

  const privacy = await req(`${WEB}/privacy`);
  if (privacy.res.ok && privacy.text.includes('מדיניות פרטיות')) ok('privacy policy page');
  else fail('privacy policy page');

  const manifest = await req(`${WEB}/manifest.webmanifest`);
  if (manifest.res.ok && manifest.text.includes('RideTogether')) ok('PWA manifest');
  else fail('PWA manifest', String(manifest.res.status));
});

console.log(`\n==============================`);
console.log(`QA RESULT: ${passed} passed, ${failed} failed`);
console.log(`==============================\n`);

if (failed > 0) process.exit(1);
