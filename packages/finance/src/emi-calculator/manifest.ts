import type { ToolManifest } from '@toolbox/shared';

const manifest: ToolManifest = {
  id: 'emi-calculator',
  slug: 'emi-calculator',
  name: 'EMI Calculator',
  category: 'finance',
  tags: ['emi', 'loan', 'instalment', 'finance', 'monthly'],
  description: 'Calculate Equated Monthly Instalment for any loan.',
  icon: 'ChartBar',
  version: '0.1.0',
  packageName: '@toolbox/finance',
  route: '/finance/emi-calculator',
  apiEndpoint: '/api/v1/finance/emi-calculator',
  visibility: 'public',
  featured: true,
  experimental: false,
  interfaces: { api: true, cli: true, web: true, mcp: false, npm: true },
  complexity: 'O(1)',
  requiresAuth: false,
  relatedTools: ['loan-calculator', 'compound-interest'],
  githubPath: 'packages/finance/src/emi-calculator',
  inputs: [
    { name: 'principal', label: 'Principal', type: 'number', unit: '₹' },
    { name: 'annualRatePercent', label: 'Annual Rate', type: 'number', unit: '%' },
    { name: 'tenureMonths', label: 'Tenure', type: 'number', unit: 'months' },
  ],
  outputs: [
    { name: 'emi', label: 'Monthly EMI', type: 'number', unit: '₹' },
    { name: 'totalAmount', label: 'Total Amount', type: 'number', unit: '₹' },
    { name: 'totalInterest', label: 'Total Interest', type: 'number', unit: '₹' },
    {
      name: 'monthlyRate',
      label: 'Monthly Rate',
      type: 'number',
      unit: 'decimal',
      description: 'Monthly interest rate as a decimal fraction (e.g. 0.0075 for 9% p.a.). Divide annualRatePercent by 1200.',
    },
  ],
  examples: [
    {
      label: 'Car Loan',
      input: { principal: 800000, annualRatePercent: 9, tenureMonths: 60 },
      output: { emi: 16606.68, totalAmount: 996400.8, totalInterest: 196400.8, monthlyRate: 0.0075 },
    },
  ],
  changelog: [
    { version: '0.1.0', date: '2025-01-01', changes: ['Initial release'] },
    { version: '0.1.1', date: '2025-07-17', changes: ['Fix: monthlyRate output unit corrected from % to decimal fraction'] },
  ],
};

export default manifest;
