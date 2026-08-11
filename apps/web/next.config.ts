import type { NextConfig } from 'next';
import path from 'path';

/**
 * MOBILE_STATIC_EXPORT=1 → fully static build (output: 'export') used to bundle
 * the UI inside the Capacitor iOS/Android apps. Regular server build otherwise.
 */
const isStaticExport = process.env.MOBILE_STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '../..'),
  ...(isStaticExport
    ? {
        output: 'export' as const,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
