'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme';
import { RoleGate } from '@/components/chrome/RoleGate';
import { BrandMark } from '@/components/brand/BrandMark';

const NAV: Record<string, { href: string; label: string }[]> = {
  rider: [
    { href: '/rider', label: 'בית' },
    { href: '/rider/events', label: 'מפגשים' },
    { href: '/rider/upcoming', label: 'שלי' },
    { href: '/rider/profile', label: 'פרופיל' },
  ],
  parent: [
    { href: '/parent', label: 'בית' },
    { href: '/parent/applications', label: 'בקשות' },
    { href: '/parent/event', label: 'מפגש' },
    { href: '/parent/consents', label: 'הסכמות' },
  ],
  manager: [
    { href: '/manager', label: 'לוח' },
    { href: '/manager/applications', label: 'בקשות' },
    { href: '/manager/waiting', label: 'המתנה' },
    { href: '/manager/events/new', label: 'מפגש' },
  ],
  admin: [
    { href: '/admin', label: 'לוח' },
    { href: '/admin/tenants', label: 'ארגונים' },
    { href: '/admin/users', label: 'משתמשים' },
    { href: '/admin/roles', label: 'תפקידים' },
  ],
};

const AREA_ROLES: Record<string, string[]> = {
  rider: ['RIDER', 'ADMIN', 'EVENT_MANAGER'],
  parent: ['PARENT', 'ADMIN'],
  manager: ['EVENT_MANAGER', 'ADMIN'],
  admin: ['ADMIN', 'SUPER_ADMIN'],
};

export function AppChrome({
  area,
  title,
  subtitle,
  children,
}: {
  area: 'rider' | 'parent' | 'manager' | 'admin' | 'public';
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { me, switchToTenant } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const items = area === 'public' ? [] : NAV[area];
  const activeIndex = items.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href !== `/${area}` && pathname.startsWith(item.href)),
  );

  const body = (
    <div className="rt-container flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 px-5 pb-4 pt-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <BrandMark href="/home" size={34} />
          <div className="flex items-center gap-3">
            {me?.memberships && me.memberships.length > 1 ? (
              <select
                className="max-w-[140px] truncate border border-line bg-surface px-2 py-1 text-xs font-semibold text-ink"
                value={me.activeTenant?.id ?? ''}
                onChange={(e) => {
                  if (e.target.value) void switchToTenant(e.target.value);
                }}
                aria-label="החלפת ארגון"
              >
                {me.memberships.map((m) => (
                  <option key={m.tenantId} value={m.tenantId}>
                    {m.name}
                  </option>
                ))}
              </select>
            ) : me?.activeTenant ? (
              <span className="max-w-[120px] truncate text-xs text-muted">{me.activeTenant.name}</span>
            ) : null}
            <button
              type="button"
              onClick={toggleTheme}
              className="text-sm font-medium text-muted"
              aria-label={theme === 'dark' ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
              title={theme === 'dark' ? 'מצב בהיר' : 'מצב כהה'}
            >
              {theme === 'dark' ? 'בהיר' : 'כהה'}
            </button>
            <Link href="/settings" className="text-sm font-medium text-accent">
              הגדרות
            </Link>
          </div>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight text-ink"
        >
          {title}
        </motion.h1>
        {subtitle ? <p className="mt-1 text-sm leading-relaxed text-muted">{subtitle}</p> : null}
      </header>

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 px-5 py-5"
        style={{ paddingBottom: items.length ? 'calc(var(--nav-h) + var(--safe-bottom) + 16px)' : 24 }}
      >
        {children}
      </motion.main>

      {items.length > 0 ? (
        <nav
          className="fixed bottom-0 left-0 right-0 z-20 border-t border-line bg-surface/95 backdrop-blur-md"
          style={{ paddingBottom: 'var(--safe-bottom)' }}
        >
          <div className="rt-container relative grid grid-cols-4 px-2 pt-1" style={{ height: 'var(--nav-h)' }}>
            {activeIndex >= 0 ? (
              <motion.div
                layoutId={`nav-indicator-${area}`}
                className="absolute top-0 h-0.5 bg-accent"
                style={{
                  width: `${100 / items.length}%`,
                  right: `${(activeIndex * 100) / items.length}%`,
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              />
            ) : null}
            {items.map((item, i) => {
              const active = i === activeIndex;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-center text-[13px] font-semibold transition duration-fast ${
                    active ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );

  if (area === 'public') return body;
  return <RoleGate roles={AREA_ROLES[area]}>{body}</RoleGate>;
}
