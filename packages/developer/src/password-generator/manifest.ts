import type { ToolManifest } from '@toolbox/shared';

const manifest: ToolManifest = {
  id: 'password-generator',
  slug: 'password-generator',
  name: 'Password Generator',
  category: 'developer',
  tags: ['password', 'security', 'random', 'crypto', 'generator'],
  description: 'Generate cryptographically secure passwords with configurable character sets.',
  icon: 'Lock',
  version: '0.1.0',
  packageName: '@toolbox/developer',
  route: '/developer/password-generator',
  apiEndpoint: '/api/v1/developer/password-generator',
  visibility: 'public',
  featured: true,
  experimental: false,
  interfaces: { api: true, cli: true, web: true, mcp: false, npm: true },
  complexity: 'O(n)',
  requiresAuth: false,
  relatedTools: ['uuid-generator'],
  githubPath: 'packages/developer/src/password-generator',
  inputs: [
    { name: 'length', label: 'Length', type: 'number', min: 4, max: 256, defaultValue: 16 },
    { name: 'includeLowercase', label: 'Lowercase (a-z)', type: 'boolean', defaultValue: true },
    { name: 'includeUppercase', label: 'Uppercase (A-Z)', type: 'boolean', defaultValue: true },
    { name: 'includeNumbers', label: 'Numbers (0-9)', type: 'boolean', defaultValue: true },
    { name: 'includeSymbols', label: 'Symbols (!@#…)', type: 'boolean', defaultValue: false },
    { name: 'excludeAmbiguous', label: 'Exclude Ambiguous', type: 'boolean', defaultValue: false },
    { name: 'count', label: 'Count', type: 'number', min: 1, max: 100, defaultValue: 1 },
  ],
  outputs: [
    { name: 'passwords', label: 'Generated Passwords', type: 'array' },
    { name: 'entropy', label: 'Entropy (bits)', type: 'number' },
    { name: 'strength', label: 'Strength', type: 'enum', options: [
      { label: 'Weak', value: 'weak' },
      { label: 'Fair', value: 'fair' },
      { label: 'Strong', value: 'strong' },
      { label: 'Very Strong', value: 'very-strong' },
    ]},
  ],
  examples: [],
  changelog: [{ version: '0.1.0', date: '2025-01-01', changes: ['Initial release'] }],
};

export default manifest;
