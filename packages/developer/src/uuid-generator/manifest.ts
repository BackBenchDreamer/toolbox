import type { ToolManifest } from '@toolbox/shared';

const manifest: ToolManifest = {
  id: 'uuid-generator',
  slug: 'uuid-generator',
  name: 'UUID Generator',
  category: 'developer',
  tags: ['uuid', 'guid', 'unique', 'identifier', 'v4', 'v7', 'random'],
  description: 'Generate cryptographically secure UUIDs (v4 random or v7 time-ordered).',
  icon: 'Fingerprint',
  version: '0.1.0',
  packageName: '@toolbox/developer',
  route: '/developer/uuid-generator',
  apiEndpoint: '/api/v1/developer/uuid-generator',
  visibility: 'public',
  featured: true,
  experimental: false,
  interfaces: { api: true, cli: true, web: true, mcp: false, npm: true },
  complexity: 'O(n)',
  estimatedMs: 0.1,
  requiresAuth: false,
  relatedTools: ['password-generator'],
  githubPath: 'packages/developer/src/uuid-generator',
  inputs: [
    { name: 'count', label: 'Count', type: 'number', min: 1, max: 100, defaultValue: 1 },
    { name: 'version', label: 'Version', type: 'select', options: [
      { label: 'v4 (random)', value: 'v4' },
      { label: 'v7 (time-ordered)', value: 'v7' },
    ]},
    { name: 'uppercase', label: 'Uppercase', type: 'boolean', defaultValue: false },
  ],
  outputs: [
    { name: 'uuids', label: 'UUIDs', type: 'array' },
    { name: 'version', label: 'Version', type: 'string' },
  ],
  examples: [
    { label: 'Single v4 UUID', input: { count: 1, version: 'v4', uppercase: false }, output: { uuids: ['xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'], version: 'v4' } },
  ],
  changelog: [{ version: '0.1.0', date: '2025-01-01', changes: ['Initial release'] }],
};

export default manifest;
