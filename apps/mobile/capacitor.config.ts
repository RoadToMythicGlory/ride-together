import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Store / CI: set CAPACITOR_SERVER_URL to your public HTTPS web app
 * (e.g. https://app.ridetogether.org). Dev defaults to local Next.js.
 */
const serverUrl =
  process.env.CAPACITOR_SERVER_URL?.trim() ||
  process.env.MOBILE_WEB_URL?.trim() ||
  'http://localhost:3000';
const isHttps = serverUrl.startsWith('https://');

const config: CapacitorConfig = {
  appId: 'org.ridetogether.app',
  appName: 'RideTogether',
  webDir: 'www',
  server: {
    url: serverUrl,
    cleartext: !isHttps,
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'RideTogether',
  },
  android: {
    allowMixedContent: !isHttps,
  },
};

export default config;
