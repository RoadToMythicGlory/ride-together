import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Production (store builds): the web UI is bundled into `www/` (Next.js static
 * export) — no server URL, the app is fully self-contained.
 *
 * Dev only: set CAPACITOR_SERVER_URL (or MOBILE_WEB_URL) to point the shell at
 * a running dev server, e.g. http://localhost:3000.
 */
const devServerUrl =
  process.env.CAPACITOR_SERVER_URL?.trim() || process.env.MOBILE_WEB_URL?.trim() || '';

const config: CapacitorConfig = {
  appId: 'org.ridetogether.app',
  appName: 'RideTogether',
  webDir: 'www',
  ...(devServerUrl
    ? {
        server: {
          url: devServerUrl,
          cleartext: !devServerUrl.startsWith('https://'),
        },
      }
    : {}),
  ios: {
    contentInset: 'automatic',
    scheme: 'RideTogether',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
