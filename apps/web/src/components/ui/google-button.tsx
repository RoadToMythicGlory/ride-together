'use client';

import { useEffect, useRef, useState } from 'react';
import {
  GOOGLE_WEB_CLIENT_ID,
  isGoogleLoginEnabled,
  isNativePlatform,
  loadGoogleIdentityScript,
  nativeGoogleIdToken,
} from '@/lib/google-auth';

type Props = {
  onCredential: (idToken: string) => void | Promise<void>;
  onError?: (message: string) => void;
};

/**
 * "Sign in with Google" button.
 * Web: renders the official GIS button. Native (Capacitor): custom button that
 * triggers the native Google sign-in flow.
 */
export function GoogleButton({ onCredential, onError }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const [native, setNative] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNative(isNativePlatform());
  }, []);

  useEffect(() => {
    if (!isGoogleLoginEnabled() || native) return;
    let cancelled = false;
    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !divRef.current) return;
        const g = (window as any).google;
        g.accounts.id.initialize({
          client_id: GOOGLE_WEB_CLIENT_ID,
          callback: (resp: { credential?: string }) => {
            if (resp?.credential) void onCredential(resp.credential);
          },
        });
        g.accounts.id.renderButton(divRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          locale: 'he',
          width: 320,
        });
      })
      .catch((err: unknown) => {
        onError?.(err instanceof Error ? err.message : 'שגיאה בטעינת Google');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [native]);

  if (!isGoogleLoginEnabled()) return null;

  if (native) {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          try {
            const idToken = await nativeGoogleIdToken();
            await onCredential(idToken);
          } catch (err) {
            onError?.(err instanceof Error ? err.message : 'שגיאה בהתחברות עם Google');
          } finally {
            setLoading(false);
          }
        }}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-line bg-bg px-4 py-3 text-[15px] font-semibold text-ink transition-opacity disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        {loading ? 'מתחבר…' : 'המשך עם Google'}
      </button>
    );
  }

  return <div ref={divRef} className="flex justify-center" />;
}
