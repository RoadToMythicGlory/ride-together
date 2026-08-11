'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearSession,
  getMe,
  hasSessionToken,
  listMyTenants,
  switchTenant,
  type MeResponse,
} from '@/lib/api';

type AuthState = {
  me: MeResponse | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
  can: (permission: string) => boolean;
  hasRole: (...roles: string[]) => boolean;
  isSuperAdmin: boolean;
  switchToTenant: (tenantId: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // Public pages (landing, about, etc.) must stay ungated — skip /me with no session.
    if (!hasSessionToken()) {
      setMe(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getMe({ redirectOnAuthFailure: false });
      if (!data.memberships?.length) {
        const tenants = await listMyTenants().catch(() => []);
        data.memberships = tenants.map((t: any) => ({
          tenantId: t.id,
          slug: t.slug,
          name: t.name,
          roles: t.roles,
          isActive: t.isActiveTenant,
        }));
      }
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<AuthState>(() => {
    const isSuperAdmin = Boolean(me?.platformRoles?.includes('SUPER_ADMIN'));
    return {
      me,
      loading,
      refresh,
      logout: () => {
        clearSession();
        setMe(null);
        window.location.href = '/login';
      },
      can: (permission: string) => {
        if (!me) return false;
        if (isSuperAdmin) return true;
        return (me.permissions ?? []).includes(permission);
      },
      hasRole: (...roles: string[]) => {
        if (!me) return false;
        if (isSuperAdmin) return true;
        const tenantRoles = me.tenantRoles ?? [];
        const platformRoles = me.platformRoles ?? [];
        return roles.some((r) => tenantRoles.includes(r) || platformRoles.includes(r));
      },
      isSuperAdmin,
      switchToTenant: async (tenantId: string) => {
        const data = await switchTenant(tenantId);
        const { saveSession } = await import('@/lib/api');
        saveSession(data);
        await refresh();
      },
    };
  }, [me, loading, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
