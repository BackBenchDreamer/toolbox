import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@toolbox/shared',
    '@toolbox/finance',
    '@toolbox/utilities',
    '@toolbox/developer',
    '@toolbox/registry',
  ],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
