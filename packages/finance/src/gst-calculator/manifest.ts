import type { ToolManifest } from '@toolbox/shared';

const manifest: ToolManifest = {
  id: 'gst-calculator',
  slug: 'gst-calculator',
  name: 'GST Calculator',
  category: 'finance',
  tags: ['gst', 'tax', 'india', 'cgst', 'sgst', 'invoice'],
  description: 'Calculate GST — add to or extract from a given amount.',
  icon: 'Receipt',
  version: '0.1.0',
  packageName: '@toolbox/finance',
  route: '/finance/gst-calculator',
  apiEndpoint: '/api/v1/finance/gst-calculator',
  visibility: 'public',
  featured: false,
  experimental: false,
  interfaces: { api: true, cli: true, web: true, mcp: false, npm: true },
  complexity: 'O(1)',
  requiresAuth: false,
  relatedTools: ['loan-calculator'],
  githubPath: 'packages/finance/src/gst-calculator',
  inputs: [
    { name: 'amount', label: 'Amount', type: 'number', unit: '₹' },
    {
      name: 'gstPercent',
      label: 'GST Rate',
      type: 'select',
      options: [
        { label: '5%', value: 5 },
        { label: '12%', value: 12 },
        { label: '18%', value: 18 },
        { label: '28%', value: 28 },
      ],
    },
    {
      name: 'mode',
      label: 'Mode',
      type: 'select',
      options: [
        { label: 'Add GST (exclusive)', value: 'exclusive' },
        { label: 'Extract GST (inclusive)', value: 'inclusive' },
      ],
    },
  ],
  outputs: [
    { name: 'baseAmount', label: 'Base Amount', type: 'number', unit: '₹' },
    { name: 'gstAmount', label: 'GST Amount', type: 'number', unit: '₹' },
    { name: 'totalAmount', label: 'Total Amount', type: 'number', unit: '₹' },
    { name: 'cgst', label: 'CGST', type: 'number', unit: '₹' },
    { name: 'sgst', label: 'SGST', type: 'number', unit: '₹' },
    { name: 'effectiveRate', label: 'Effective Rate', type: 'number', unit: '%' },
  ],
  examples: [
    {
      label: '₹10,000 + 18% GST',
      input: { amount: 10000, gstPercent: 18, mode: 'exclusive' },
      output: { baseAmount: 10000, gstAmount: 1800, totalAmount: 11800, cgst: 900, sgst: 900 },
    },
  ],
  changelog: [{ version: '0.1.0', date: '2025-01-01', changes: ['Initial release'] }],
};

export default manifest;
