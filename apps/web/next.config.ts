import { withContentCollections } from '@content-collections/next';
import { env } from '@repo/env';
import { config, withAnalyzer, withSentry } from '@repo/next-config';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = { ...config };


  nextConfig.images = {
    domains: ['cdn.jsdelivr.net'], // Allow the specified hostname
  };

// Add security headers to allow window communication
nextConfig.headers = async () => {
  return [
    {
      // Apply these headers to all routes
      source: '/(.*)',
      headers: [
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin-allow-popups',
        },
        {
          key: 'Cross-Origin-Embedder-Policy',
          value: 'credentialless',
        },
      ],
    },
    {
      // More permissive COOP for auth pages to allow window.opener communication
      source: '/(sign-in|sign-up|auth-callback)(.*)',
      headers: [
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'unsafe-none',
        },
      ],
    },
  ];
};

if (process.env.NODE_ENV === 'production') {
  const redirects: NextConfig['redirects'] = async () => [
    {
      source: '/legal',
      destination: '/legal/privacy',
      statusCode: 301,
    },
  ];

  nextConfig.redirects = redirects;
}

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

export default withContentCollections(nextConfig);
