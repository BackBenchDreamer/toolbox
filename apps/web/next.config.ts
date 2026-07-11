import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Do NOT use transpilePackages for @toolbox/* packages.
  // All packages are pre-built (tsup → dist/) and expose proper package.json
  // exports fields. Next.js resolves them from dist/, not from source.
  // transpilePackages would make webpack try to compile the TypeScript source,
  // which uses .js extension imports that webpack cannot resolve.
};

export default nextConfig;
