import type { ToolManifest } from '@toolbox/shared';

const manifest: ToolManifest = {
  id: 'reverse-loan',
  slug: 'reverse-loan',
  name: 'Reverse Loan Calculator',
  category: 'finance',
  tags: ['loan', 'finance', 'reverse', 'principal', 'emi'],
  description: 'Given a monthly EMI, interest rate, and tenure, calculate the original loan principal.',
  longDescription:
    'Inverts the standard EMI formula to derive the principal. Useful when you know what you can afford to pay each month and want to know the maximum loan you can take.',
  icon: 'Calculator',
  version: '0.1.0',
  packageName: '@toolbox/finance',
  route: '/finance/reverse-loan',
  apiEndpoint: '/api/v1/finance/reverse-loan',
  visibility: 'public',
  featured: false,
  experimental: false,
  interfaces: { api: true, cli: true, web: true, mcp: false, npm: true },
  complexity: 'O(1)',
  requiresAuth: false,
  relatedTools: ['loan-calculator', 'emi-calculator'],
  githubPath: 'packages/finance/src/loan-calculator',
  inputs: [
    { name: 'emi', label: 'Monthly EMI', type: 'number', unit: '₹', description: 'Known monthly payment' },
    { name: 'annualRatePercent', label: 'Annual Rate', type: 'number', unit: '%', description: 'Interest rate per year' },
    { name: 'tenureMonths', label: 'Tenure', type: 'number', unit: 'months', description: 'Loan term in months' },
  ],
  outputs: [
    { name: 'principal', label: 'Derived Principal', type: 'number', unit: '₹' },
    { name: 'totalPayment', label: 'Total Payment', type: 'number', unit: '₹' },
    { name: 'totalInterest', label: 'Total Interest', type: 'number', unit: '₹' },
    { name: 'interestPercent', label: 'Interest %', type: 'number', unit: '%' },
  ],
  examples: [
    {
      label: 'Find principal for ₹10,000 EMI',
      input: { emi: 10000, annualRatePercent: 10, tenureMonths: 12 },
      output: { principal: 113669, totalPayment: 120000, totalInterest: 6331 },
    },
  ],
  changelog: [{ version: '0.1.0', date: '2025-01-01', changes: ['Initial release'] }],
};

export default manifest;
