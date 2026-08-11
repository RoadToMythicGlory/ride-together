const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rt_access');
}

function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rt_refresh');
}

export function saveSession(data: {
  accessToken: string;
  refreshToken: string;
}) {
  localStorage.setItem('rt_access', data.accessToken);
  localStorage.setItem('rt_refresh', data.refreshToken);
}

export function clearSession() {
  localStorage.removeItem('rt_access');
  localStorage.removeItem('rt_refresh');
}

function friendlyAuthError(status: number, raw: string) {
  const lower = raw.toLowerCase();
  if (status === 401 || lower.includes('unauthorized') || lower.includes('not authenticated')) {
    return 'יש להתחבר מחדש כדי לצפות במסך זה';
  }
  if (status === 403 || lower.includes('insufficient') || lower.includes('forbidden')) {
    return 'אין לחשבון הזה הרשאה למסך זה (בדקו תפקיד: רוכב / הורה / מארגן)';
  }
  return raw || `Request failed (${status})`;
}

async function parseError(res: Response) {
  const body = await res.json().catch(() => ({}));
  const message = body.message;
  const raw = Array.isArray(message) ? message.join(', ') : message ?? `Request failed (${res.status})`;
  return friendlyAuthError(res.status, String(raw));
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) {
          clearSession();
          return false;
        }
        const data = await res.json();
        if (!data.accessToken || !data.refreshToken) {
          clearSession();
          return false;
        }
        saveSession(data);
        return true;
      } catch {
        clearSession();
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

function isPublicPath(path: string) {
  return (
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password') ||
    path.startsWith('/verify-email') ||
    path.startsWith('/about') ||
    path.startsWith('/how-it-works') ||
    path.startsWith('/safety') ||
    path.startsWith('/contact') ||
    path.startsWith('/privacy') ||
    path.startsWith('/terms') ||
    path.startsWith('/cookies')
  );
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  if (isPublicPath(path)) return;
  const next = encodeURIComponent(path + window.location.search);
  window.location.href = `/login?next=${next}`;
}

async function authFetch(
  path: string,
  options: RequestInit & { redirectOnAuthFailure?: boolean } = {},
  retried = false,
): Promise<any> {
  const { redirectOnAuthFailure = true, ...fetchOptions } = options;
  const token = getAccessToken();
  if (!token) {
    if (redirectOnAuthFailure) redirectToLogin();
    throw new Error('יש להתחבר מחדש כדי לצפות במסך זה');
  }

  const res = await fetch(`${API_URL}/api${path}`, {
    ...fetchOptions,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(fetchOptions.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (res.status === 401 && !retried) {
    const refreshed = await tryRefreshSession();
    if (refreshed) return authFetch(path, options, true);
    if (redirectOnAuthFailure) redirectToLogin();
    throw new Error('יש להתחבר מחדש כדי לצפות במסך זה');
  }

  if (!res.ok) throw new Error(await parseError(res));
  if (res.status === 204) return null;
  return res.json();
}

export function hasSessionToken() {
  return Boolean(getAccessToken());
}

export async function apiHealth() {
  const res = await fetch(`${API_URL}/api/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error('API unavailable');
  return res.json() as Promise<{ ok: boolean; service: string }>;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function register(input: {
  email: string;
  password: string;
  fullName: string;
  capabilities: Array<'RIDER' | 'PARENT'>;
  ageAttested18: boolean;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function resetPassword(token: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function verifyEmail(token: string) {
  const res = await fetch(`${API_URL}/api/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export type MeResponse = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  locale: string;
  emailVerified?: boolean;
  platformRoles: string[];
  activeTenant: { id: string; slug: string; name: string } | null;
  tenantRoles: string[];
  permissions?: string[];
  memberships?: Array<{
    tenantId: string;
    slug: string;
    name: string;
    roles: string[];
    isActive: boolean;
  }>;
  capabilities: { rider: boolean; parent: boolean };
};

export async function getMe(opts?: { redirectOnAuthFailure?: boolean }): Promise<MeResponse> {
  return authFetch('/me', { redirectOnAuthFailure: opts?.redirectOnAuthFailure ?? true });
}

export async function exportMyData() {
  return authFetch('/me/export');
}

export async function deleteAccount(confirmation: string) {
  return authFetch('/me', {
    method: 'DELETE',
    body: JSON.stringify({ confirmation }),
  });
}

export async function listRegions() {
  const res = await fetch(`${API_URL}/api/regions`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createApplication(input: Record<string, unknown>) {
  return authFetch('/applications', { method: 'POST', body: JSON.stringify(input) });
}

export async function listMyApplications() {
  return authFetch('/applications/mine');
}

export async function listApplicationQueue() {
  return authFetch('/applications/queue');
}

export async function getApplication(id: string) {
  return authFetch(`/applications/${id}`);
}

export async function transitionApplication(id: string, status: string, reason?: string) {
  return authFetch(`/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
}

export async function assignApplication(id: string, eventId: string) {
  return authFetch(`/applications/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ eventId }),
  });
}

export async function listEvents() {
  return authFetch('/events');
}

export async function getEvent(id: string) {
  return authFetch(`/events/${id}`);
}

export async function createEvent(input: Record<string, unknown>) {
  return authFetch('/events', { method: 'POST', body: JSON.stringify(input) });
}

export async function setEventStatus(id: string, status: string) {
  return authFetch(`/events/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function rsvpEvent(id: string, status: string, motorcycleInfo?: string) {
  return authFetch(`/events/${id}/rsvp`, {
    method: 'POST',
    body: JSON.stringify({ status, motorcycleInfo }),
  });
}

export async function listMyRsvps() {
  return authFetch('/events/mine/rsvps');
}

export async function listMyParticipations() {
  return authFetch('/participations/mine');
}

export async function respondParticipation(id: string, status: string) {
  return authFetch(`/participations/${id}/respond`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export async function saveConsents(items: Array<{ consentType: string; version: string; accepted: boolean }>) {
  return authFetch('/me/consents', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });
}

export async function listConsents() {
  return authFetch('/me/consents');
}

export async function listMyTenants() {
  return authFetch('/tenants/mine');
}

export async function listAllTenants() {
  return authFetch('/tenants');
}

export async function createTenant(input: { name: string; slug: string }) {
  return authFetch('/tenants', { method: 'POST', body: JSON.stringify(input) });
}

export async function switchTenant(tenantId: string) {
  return authFetch('/auth/switch-tenant', {
    method: 'POST',
    body: JSON.stringify({ tenantId }),
  });
}

export async function listTenantMembers(tenantId: string) {
  return authFetch(`/tenants/${tenantId}/members`);
}

export async function addTenantMember(
  tenantId: string,
  input: { email: string; roles: string[] },
) {
  return authFetch(`/tenants/${tenantId}/members`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function setTenantMemberRoles(
  tenantId: string,
  userId: string,
  input: { roles: string[]; status?: string },
) {
  return authFetch(`/tenants/${tenantId}/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function listRoles() {
  return authFetch('/roles');
}

export async function listPermissionsCatalog() {
  return authFetch('/permissions');
}

export async function setRolePermissions(roleKey: string, permissions: string[]) {
  return authFetch(`/roles/${roleKey}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  });
}
