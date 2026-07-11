import type { ToolManifest } from '@toolbox/shared';

const manifest: ToolManifest = {
  id: 'prepayment-simulation',
  slug: 'prepayment-simulation',
  name: 'Prepayment Simulator',
  category: 'finance',
  tags: ['loan', 'finance', 'prepayment', 'interest', 'savings'],
  description: 'Simulate the effect of lump-sum prepayments on your loan to see interest saved and early payoff.',
  longDescription:
    'Models one or more lump-sum prepayments against a standard EMI loan. Shows the reduced tenure, total interest saved, and a revised month-by-month schedule.',
  icon: 'Calculator',
  version: '0.1.0',
  packageName: '@toolbox/finance',
  route: '/finance/prepayment-simulation',
  apiEndpoint: '/api/v1/finance/prepayment-simulation',
  visibility: 'public',
  featured: false,
  experimental: false,
  interfaces: { api: true, cli: true, web: false, mcp: false, npm: true },
  complexity: 'O(n)',
  requiresAuth: false,
  relatedTools: ['loan-calculator', 'reverse-loan'],
  githubPath: 'packages/finance/src/loan-calculator',
  inputs: [
    { name: 'principal', label: 'Principal', type: 'number', unit: '₹' },
    { name: 'annualRatePercent', label: 'Annual Rate', type: 'number', unit: '%' },
    { name: 'tenureMonths', label: 'Tenure', type: 'number', unit: 'months' },
    { name: 'prepayments', label: 'Prepayments', type: 'array', description: 'Array of {month, amount} events' },
  ],
  outputs: [
    { name: 'interestSaved', label: 'Interest Saved', type: 'number', unit: '₹' },
    { name: 'monthsSaved', label: 'Months Saved', type: 'number', unit: 'months' },
    { name: 'newTenureMonths', label: 'New Tenure', type: 'number', unit: 'months' },
    { name: 'schedule', label: 'Revised Schedule', type: 'array', optional: true },
  ],
  examples: [
    {
      label: 'One prepayment of ₹50,000 at month 12',
      input: { principal: 500000, annualRatePercent: 10, tenureMonths: 60, prepayments: [{ month: 12, amount: 50000 }] },
      output: { interestSaved: 8241, monthsSaved: 6, newTenureMonths: 54 },
    },
  ],
  changelog: [{ version: '0.1.0', date: '2025-01-01', changes: ['Initial release'] }],
};

export default manifest;
