/** RBAC + multi-tenant isolation checks */
const API = process.env.API_URL ?? 'http://localhost:3001/api';
let passed = 0;
let failed = 0;
const ok = (n, d = '') => {
  passed += 1;
  console.log(`  ✓ ${n}${d ? ` — ${d}` : ''}`);
};
const fail = (n, d = '') => {
  failed += 1;
  console.error(`  ✗ ${n}${d ? ` — ${d}` : ''}`);
};

async function req(url, options = {}) {
  const res = await fetch(url, options);
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function login(email, password) {
  const { res, json } = await req(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`login ${email}: ${JSON.stringify(json)}`);
  return json;
}

const auth = (t) => ({ Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' });

console.log('\n== RBAC + Multi-tenant ==');

try {
  const stamp = Date.now();
  const riderReg = await req(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `rbac.rider.${stamp}@example.com`,
      password: 'Password123!',
      fullName: 'RBAC Rider',
      capabilities: ['RIDER'],
      ageAttested18: true,
      acceptedTerms: true,
      acceptedPrivacy: true,
    }),
  });
  if (!riderReg.res.ok) throw new Error(JSON.stringify(riderReg.json));
  ok('rider register');
  const riderToken = riderReg.json.accessToken;

  const denied = await req(`${API}/applications/queue`, {
    headers: auth(riderToken),
  });
  if (denied.res.status === 403) ok('rider denied applications queue');
  else fail('rider denied applications queue', String(denied.res.status));

  const events = await req(`${API}/events`, { headers: auth(riderToken) });
  if (events.res.ok) ok('rider can list events');
  else fail('rider can list events', JSON.stringify(events.json));

  const me = await req(`${API}/me`, { headers: auth(riderToken) });
  if (me.json?.permissions?.includes('events:read_public')) ok('DB permissions on /me');
  else fail('DB permissions on /me', JSON.stringify(me.json?.permissions));

  const admin = await login('admin@ride-together.local', 'ChangeMe123!');
  const adminToken = admin.accessToken;

  const tenants = await req(`${API}/tenants`, { headers: auth(adminToken) });
  if (tenants.res.ok && tenants.json.length >= 2) ok('super admin lists tenants', String(tenants.json.length));
  else fail('super admin lists tenants', JSON.stringify(tenants.json));

  const partner = tenants.json.find((t) => t.slug === 'partner-club');
  if (!partner) throw new Error('partner-club missing — run db:seed');

  const switched = await req(`${API}/auth/switch-tenant`, {
    method: 'POST',
    headers: auth(adminToken),
    body: JSON.stringify({ tenantId: partner.id }),
  });
  if (!switched.res.ok) throw new Error(JSON.stringify(switched.json));
  ok('switch tenant to partner-club');
  const partnerToken = switched.json.accessToken;

  const partnerMe = await req(`${API}/me`, { headers: auth(partnerToken) });
  if (partnerMe.json?.activeTenant?.slug === 'partner-club') ok('active tenant is partner');
  else fail('active tenant is partner', partnerMe.json?.activeTenant?.slug);

  const partnerEvents = await req(`${API}/events`, { headers: auth(partnerToken) });
  if (partnerEvents.res.ok && partnerEvents.json.length === 0) {
    ok('partner tenant has isolated empty events');
  } else if (partnerEvents.res.ok) {
    // may have events if previously created — still ok if none match sharon demo title
    const sharon = partnerEvents.json.find((e) => String(e.title).includes('שרון'));
    if (!sharon) ok('partner events do not include default-tenant sharon demo');
    else fail('tenant isolation broken — sharon event visible in partner');
  } else fail('partner events list', JSON.stringify(partnerEvents.json));

  const roles = await req(`${API}/roles`, { headers: auth(partnerToken) });
  if (roles.res.ok && roles.json.length >= 4) ok('roles loaded from DB', String(roles.json.length));
  else fail('roles loaded from DB', JSON.stringify(roles.json));

  const riderTenants = await req(`${API}/tenants`, { headers: auth(riderToken) });
  if (riderTenants.res.status === 403) ok('non-super-admin cannot list all tenants');
  else fail('non-super-admin cannot list all tenants', String(riderTenants.res.status));

  // Cross-tenant: rider from default should not see partner-only data via assign nonsense —
  // create event in partner, ensure rider token (default tenant) doesn't see it
  const regions = await req(`${API}/regions`);
  const sharon = regions.json.find((r) => r.key === 'sharon');
  const created = await req(`${API}/events`, {
    method: 'POST',
    headers: auth(partnerToken),
    body: JSON.stringify({
      title: `Partner Only ${stamp}`,
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      regionId: sharon.id,
      aboutText: 'partner only',
      audienceText: 'testers',
      flowSteps: ['a'],
      riderTarget: 10,
      childCapacity: 2,
    }),
  });
  if (!created.res.ok) throw new Error(JSON.stringify(created.json));
  await req(`${API}/events/${created.json.id}/status`, {
    method: 'PATCH',
    headers: auth(partnerToken),
    body: JSON.stringify({ status: 'OPEN_FOR_RIDERS' }),
  });
  ok('created open event in partner tenant');

  const riderSees = await req(`${API}/events`, { headers: auth(riderToken) });
  const leak = (riderSees.json ?? []).find((e) => e.id === created.json.id);
  if (!leak) ok('default-tenant rider cannot see partner event');
  else fail('default-tenant rider cannot see partner event', 'LEAK');
} catch (e) {
  fail('suite', e.message);
}

console.log(`\nRBAC/TENANT RESULT: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
