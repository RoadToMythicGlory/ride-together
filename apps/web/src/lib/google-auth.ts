/**
 * Google Sign-In helpers.
 *
 * Web (browser / PWA): Google Identity Services (GIS) renders the official
 * button and returns an ID token ("credential").
 *
 * Native (Capacitor iOS/Android): GIS is blocked inside webviews, so we call
 * the @capgo/capacitor-social-login plugin over the Capacitor bridge instead.
 * The plugin is installed in apps/mobile; we access it via window.Capacitor so
 * the web bundle has no hard dependency on it.
 */

export const GOOGLE_WEB_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
export const GOOGLE_IOS_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_IOS ?? '';

export function isGoogleLoginEnabled() {
  return Boolean(GOOGLE_WEB_CLIENT_ID);
}

export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).Capacitor?.isNativePlatform?.());
}

let gisPromise: Promise<void> | null = null;

/** Load the GIS script once (web only). */
export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if ((window as any).google?.accounts?.id) return Promise.resolve();
  if (!gisPromise) {
    gisPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gisPromise = null;
        reject(new Error('Failed to load Google Sign-In'));
      };
      document.head.appendChild(script);
    });
  }
  return gisPromise;
}

/** Native Google sign-in via the Capacitor SocialLogin plugin. Returns an ID token. */
export async function nativeGoogleIdToken(): Promise<string> {
  const cap = (window as any).Capacitor;
  const plugin = cap?.Plugins?.SocialLogin;
  if (!plugin) {
    throw new Error('התחברות עם Google אינה זמינה בגרסה זו של האפליקציה');
  }
  await plugin.initialize({
    google: {
      webClientId: GOOGLE_WEB_CLIENT_ID,
      ...(GOOGLE_IOS_CLIENT_ID ? { iOSClientId: GOOGLE_IOS_CLIENT_ID } : {}),
    },
  });
  const res = await plugin.login({
    provider: 'google',
    options: { scopes: ['email', 'profile'] },
  });
  const idToken: string | undefined =
    res?.result?.idToken ?? res?.result?.authentication?.idToken;
  if (!idToken) throw new Error('לא התקבל אישור מ־Google');
  return idToken;
}
