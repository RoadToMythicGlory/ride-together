/**
 * End-to-end App Review loop:
 * parent apply → admin approve → assign → parent confirm → rider RSVP
 * + email verify / password reset smoke
 */
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
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { res, json, text };
}

async function login(email, password) {
  const { res, json } = await req(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`login failed ${email}: ${JSON.stringify(json)}`);
  return json;
}

function auth(token) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

console.log('\n== E2E App Review loop ==');

try {
  const stamp = Date.now();
  const parentEmail = `e2e.parent.${stamp}@example.com`;
  const riderEmail = `e2e.rider.${stamp}@example.com`;

  const parentReg = await req(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: parentEmail,
      password: 'Password123!',
      fullName: 'E2E Parent',
      capabilities: ['PARENT'],
      ageAttested18: true,
      acceptedTerms: true,
      acceptedPrivacy: true,
    }),
  });
  if (!parentReg.res.ok) throw new Error(JSON.stringify(parentReg.json));
  ok('parent register');
  const parentToken = parentReg.json.accessToken;
  const verifyToken = parentReg.json.devVerifyToken;
  if (verifyToken) {
    const v = await req(`${API}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: verifyToken }),
    });
    if (v.res.ok) ok('parent email verified');
    else fail('parent email verified', JSON.stringify(v.json));
  } else {
    fail('parent email verified', 'no devVerifyToken');
  }

  const riderReg = await req(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: riderEmail,
      password: 'Password123!',
      fullName: 'E2E Rider',
      capabilities: ['RIDER'],
      ageAttested18: true,
      acceptedTerms: true,
      acceptedPrivacy: true,
    }),
  });
  if (!riderReg.res.ok) throw new Error(JSON.stringify(riderReg.json));
  ok('rider register');
  const riderToken = riderReg.json.accessToken;
  if (riderReg.json.devVerifyToken) {
    await req(`${API}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: riderReg.json.devVerifyToken }),
    });
  }

  const app = await req(`${API}/applications`, {
    method: 'POST',
    headers: auth(parentToken),
    body: JSON.stringify({
      nickname: 'כינוי־דמו',
      ageYears: 9,
      reasonSummary: 'בקשת דמו לבדיקת חנות',
      privateStory: 'פרטי לצוות בלבד',
      acceptParticipation: true,
      acceptPrivacy: true,
    }),
  });
  if (!app.res.ok) throw new Error(`apply: ${JSON.stringify(app.json)}`);
  ok('parent submitted application', app.json.id);
  const applicationId = app.json.id;

  const admin = await login('admin@ride-together.local', 'ChangeMe123!');
  const adminToken = admin.accessToken;

  const approve = await req(`${API}/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: auth(adminToken),
    body: JSON.stringify({ status: 'APPROVED' }),
  });
  if (!approve.res.ok) throw new Error(JSON.stringify(approve.json));
  ok('admin approved application');

  const events = await req(`${API}/events`, { headers: auth(adminToken) });
  if (!events.res.ok || !events.json?.length) throw new Error('no open events');
  const eventId = events.json[0].id;
  ok('open event available', eventId);

  const assign = await req(`${API}/applications/${applicationId}/assign`, {
    method: 'POST',
    headers: auth(adminToken),
    body: JSON.stringify({ eventId }),
  });
  if (!assign.res.ok) throw new Error(JSON.stringify(assign.json));
  ok('assigned child to event');

  const parts = await req(`${API}/participations/mine`, { headers: auth(parentToken) });
  if (!parts.res.ok || !parts.json?.length) throw new Error('no participations');
  const participationId = parts.json[0].id;
  ok('parent sees participation');

  const confirm = await req(`${API}/participations/${participationId}/respond`, {
    method: 'POST',
    headers: auth(parentToken),
    body: JSON.stringify({ status: 'PARENT_CONFIRMED' }),
  });
  if (!confirm.res.ok) throw new Error(JSON.stringify(confirm.json));
  ok('parent confirmed participation');

  const rsvp = await req(`${API}/events/${eventId}/rsvp`, {
    method: 'POST',
    headers: auth(riderToken),
    body: JSON.stringify({ status: 'CONFIRMED', motorcycleInfo: 'Demo bike' }),
  });
  if (!rsvp.res.ok) throw new Error(JSON.stringify(rsvp.json));
  ok('rider RSVP confirmed');

  const detail = await req(`${API}/events/${eventId}`, { headers: auth(riderToken) });
  if (detail.json?.exactLocation) ok('exact location revealed after RSVP');
  else fail('exact location revealed after RSVP', 'missing');

  const forgot = await req(`${API}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: riderEmail }),
  });
  if (!forgot.res.ok || !forgot.json.devResetToken) {
    fail('forgot password issues token', JSON.stringify(forgot.json));
  } else {
    ok('forgot password issues token');
    const reset = await req(`${API}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: forgot.json.devResetToken,
        password: 'NewPassword123!',
      }),
    });
    if (!reset.res.ok) fail('reset password', JSON.stringify(reset.json));
    else {
      ok('reset password');
      const relogin = await login(riderEmail, 'NewPassword123!');
      if (relogin.accessToken) ok('login with new password');
      else fail('login with new password');
    }
  }

  const consents = await req(`${API}/me/consents`, {
    method: 'PUT',
    headers: auth(parentToken),
    body: JSON.stringify({
      items: [
        { consentType: 'PHOTO_INTERNAL', version: '2026-08-10', accepted: true },
        { consentType: 'FUTURE_INVITES', version: '2026-08-10', accepted: true },
      ],
    }),
  });
  if (consents.res.ok) ok('parent consents saved');
  else fail('parent consents saved', JSON.stringify(consents.json));
} catch (e) {
  fail('e2e loop', e.message);
}

console.log(`\nE2E RESULT: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
