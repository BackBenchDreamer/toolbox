import type { ToolManifest } from '@toolbox/shared';

const manifest: ToolManifest = {
  id: 'loan-calculator',
  slug: 'loan-calculator',
  name: 'Loan Calculator',
  category: 'finance',
  tags: ['loan', 'finance', 'emi', 'interest', 'principal', 'amortisation'],
  description: 'Calculate loan repayment schedule, total interest, and monthly EMI.',
  longDescription:
    'Computes monthly EMI, total payment, and total interest for any loan using the standard amortisation formula. Supports full amortisation schedule generation.',
  icon: 'Calculator',
  version: '0.1.0',
  packageName: '@toolbox/finance',
  route: '/finance/loan-calculator',
  apiEndpoint: '/api/v1/finance/loan-calculator',
  visibility: 'public',
  featured: true,
  experimental: false,
  interfaces: { api: true, cli: true, web: true, mcp: false, npm: true },
  complexity: 'O(n)',
  estimatedMs: 1,
  requiresAuth: false,
  relatedTools: ['emi-calculator', 'compound-interest', 'sip-calculator'],
  githubPath: 'packages/finance/src/loan-calculator',
  inputs: [
    { name: 'principal', label: 'Loan Amount', type: 'number', unit: '₹', description: 'Total loan principal' },
    { name: 'annualRatePercent', label: 'Annual Interest Rate', type: 'number', unit: '%', description: 'Yearly interest rate' },
    { name: 'tenureMonths', label: 'Loan Tenure', type: 'number', unit: 'months', description: 'Repayment period in months' },
    { name: 'includeSchedule', label: 'Include Schedule', type: 'boolean', optional: true, defaultValue: false },
  ],
  outputs: [
    { name: 'emi', label: 'Monthly EMI', type: 'number', unit: '₹', description: 'Raw numeric EMI — format in UI layer' },
    { name: 'totalPayment', label: 'Total Payment', type: 'number', unit: '₹' },
    { name: 'totalInterest', label: 'Total Interest', type: 'number', unit: '₹' },
    { name: 'schedule', label: 'Amortisation Schedule', type: 'array', optional: true },
  ],
  examples: [
    {
      label: 'Home Loan',
      input: { principal: 5000000, annualRatePercent: 8.5, tenureMonths: 240 },
      output: { emi: 43391.16, totalPayment: 10413878.4, totalInterest: 5413878.4 },
    },
  ],
  changelog: [{ version: '0.1.0', date: '2025-01-01', changes: ['Initial release'] }],
};

export default manifest;
