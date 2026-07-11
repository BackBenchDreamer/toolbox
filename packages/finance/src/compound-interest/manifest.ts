import type { ToolManifest } from '@toolbox/shared';

const manifest: ToolManifest = {
  id: 'compound-interest',
  slug: 'compound-interest',
  name: 'Compound Interest Calculator',
  category: 'finance',
  tags: ['compound', 'interest', 'investment', 'growth', 'finance', 'ear'],
  description: 'Calculate compound interest with flexible compounding frequency.',
  icon: 'Percent',
  version: '0.1.0',
  packageName: '@toolbox/finance',
  route: '/finance/compound-interest',
  apiEndpoint: '/api/v1/finance/compound-interest',
  visibility: 'public',
  featured: false,
  experimental: false,
  interfaces: { api: true, cli: false, web: true, mcp: false, npm: true },
  complexity: 'O(1)',
  estimatedMs: 0.05,
  requiresAuth: false,
  relatedTools: ['sip-calculator', 'loan-calculator'],
  githubPath: 'packages/finance/src/compound-interest',
  inputs: [
    { name: 'principal', label: 'Principal', type: 'number', unit: '₹' },
    { name: 'annualRatePercent', label: 'Annual Rate', type: 'number', unit: '%' },
    { name: 'years', label: 'Years', type: 'number', unit: 'years' },
    {
      name: 'compoundingsPerYear',
      label: 'Compounding Frequency',
      type: 'select',
      options: [
        { label: 'Annually', value: 1 },
        { label: 'Semi-annually', value: 2 },
        { label: 'Quarterly', value: 4 },
        { label: 'Monthly', value: 12 },
        { label: 'Daily', value: 365 },
      ],
    },
  ],
  outputs: [
    { name: 'futureValue', label: 'Future Value', type: 'number', unit: '₹' },
    { name: 'totalInterest', label: 'Total Interest', type: 'number', unit: '₹' },
    { name: 'effectiveAnnualRate', label: 'Effective Annual Rate', type: 'number', unit: '%', description: '(1 + r/n)^n − 1' },
  ],
  examples: [
    {
      label: '₹1 lakh at 8% for 5 years (monthly)',
      input: { principal: 100000, annualRatePercent: 8, years: 5, compoundingsPerYear: 12 },
      output: { futureValue: 148977.32, totalInterest: 48977.32, effectiveAnnualRate: 8.3 },
    },
  ],
  changelog: [{ version: '0.1.0', date: '2025-01-01', changes: ['Initial release'] }],
};

export default manifest;
