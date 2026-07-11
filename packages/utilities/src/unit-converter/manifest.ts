import type { ToolManifest } from '@toolbox/shared';

const manifest: ToolManifest = {
  id: 'unit-converter',
  slug: 'unit-converter',
  name: 'Unit Converter',
  category: 'utilities',
  tags: ['unit', 'convert', 'length', 'mass', 'temperature', 'area', 'volume', 'speed', 'data'],
  description: 'Convert between units across length, mass, temperature, area, volume, speed, time, and data.',
  icon: 'ArrowLeftRight',
  version: '0.1.0',
  packageName: '@toolbox/utilities',
  route: '/utilities/unit-converter',
  apiEndpoint: '/api/v1/utilities/unit-converter',
  visibility: 'public',
  featured: true,
  experimental: false,
  interfaces: { api: true, cli: true, web: true, mcp: false, npm: true },
  complexity: 'O(1)',
  estimatedMs: 0.01,
  requiresAuth: false,
  githubPath: 'packages/utilities/src/unit-converter',
  inputs: [
    { name: 'value', label: 'Value', type: 'number' },
    { name: 'from', label: 'From Unit', type: 'string', description: 'Unit key e.g. km, kg, C' },
    { name: 'to', label: 'To Unit', type: 'string', description: 'Unit key e.g. mi, lb, F' },
  ],
  outputs: [
    { name: 'value', label: 'Converted Value', type: 'number' },
    { name: 'from', label: 'From Key', type: 'string' },
    { name: 'to', label: 'To Key', type: 'string' },
    { name: 'fromLabel', label: 'From Label', type: 'string' },
    { name: 'toLabel', label: 'To Label', type: 'string' },
    { name: 'formula', label: 'Formula', type: 'string' },
  ],
  examples: [
    { label: '100km to miles', input: { value: 100, from: 'km', to: 'mi' }, output: { value: 62.13712, formula: '100 Kilometre = 62.13712 Mile' } },
    { label: '100°F to °C', input: { value: 100, from: 'F', to: 'C' }, output: { value: 37.77778, formula: '100 Fahrenheit = 37.77778 Celsius' } },
  ],
  changelog: [{ version: '0.1.0', date: '2025-01-01', changes: ['Initial release — 8 unit categories, 50+ units'] }],
};

export default manifest;
