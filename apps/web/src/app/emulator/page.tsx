'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { GROUP_LABELS, SCREENS } from '@/lib/screens';

const DEVICES = [
  { id: 'iphone-15', label: 'iPhone 15', width: 393, height: 852 },
  { id: 'iphone-se', label: 'iPhone SE', width: 375, height: 667 },
  { id: 'pixel-8', label: 'Pixel 8', width: 412, height: 915 },
  { id: 'galaxy-s24', label: 'Galaxy S24', width: 360, height: 780 },
] as const;

export default function EmulatorPage() {
  const [deviceId, setDeviceId] = useState<(typeof DEVICES)[number]['id']>('iphone-15');
  const [path, setPath] = useState('/');
  const [reloadKey, setReloadKey] = useState(0);

  const device = useMemo(
    () => DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0],
    [deviceId],
  );
  const groups = Object.keys(GROUP_LABELS) as Array<keyof typeof GROUP_LABELS>;

  return (
    <div className="min-h-screen bg-void text-white" dir="rtl">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-8 lg:flex-row lg:items-start">
        <aside className="scrollbar-none w-full max-w-md space-y-5 lg:sticky lg:top-6 lg:max-h-[92vh] lg:overflow-y-auto">
          <div>
            <Link href="/" className="text-[13px] font-extrabold tracking-tight text-accent">
              RideTogether
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Preview</h1>
            <p className="mt-2 text-sm text-white/50">
              Precision Daylight · {SCREENS.length} screens
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-xs text-white/40">Device</span>
            <select
              value={deviceId}
              onChange={(e) =>
                setDeviceId(e.target.value as (typeof DEVICES)[number]['id'])
              }
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
            >
              {DEVICES.map((d) => (
                <option key={d.id} value={d.id} className="bg-void">
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/80"
          >
            Reload
          </button>

          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group}>
                <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
                  {GROUP_LABELS[group]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SCREENS.filter((s) => s.group === group).map((s) => (
                    <button
                      key={s.href}
                      type="button"
                      onClick={() => setPath(s.href)}
                      className={`rounded-md px-2.5 py-1 text-xs transition ${
                        path === s.href
                          ? 'bg-accent text-white'
                          : 'bg-white/5 text-white/65 hover:bg-white/10'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex flex-1 justify-center pb-10">
          <div
            className="relative rounded-[2.2rem] bg-[#1a2030] p-3 ring-1 ring-white/10"
            style={{ width: device.width + 28 }}
          >
            <div className="absolute left-1/2 top-2.5 z-10 h-4 w-28 -translate-x-1/2 rounded-full bg-black/70" />
            <div
              className="overflow-hidden rounded-[1.7rem] bg-bg"
              style={{ width: device.width, height: device.height }}
            >
              <iframe
                key={`${path}-${reloadKey}-${device.id}`}
                title="RideTogether preview"
                src={path}
                className="h-full w-full border-0 bg-bg"
              />
            </div>
            <p className="mt-3 text-center font-mono text-[11px] text-white/35">{path}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
