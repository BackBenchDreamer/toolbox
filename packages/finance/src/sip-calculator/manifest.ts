import type { ToolManifest } from '@toolbox/shared';

const manifest: ToolManifest = {
  id: 'sip-calculator',
  slug: 'sip-calculator',
  name: 'SIP Calculator',
  category: 'finance',
  tags: ['sip', 'investment', 'mutual fund', 'wealth', 'returns'],
  description: 'Calculate returns on your Systematic Investment Plan (SIP).',
  icon: 'TrendingUp',
  version: '0.1.0',
  packageName: '@toolbox/finance',
  route: '/finance/sip-calculator',
  apiEndpoint: '/api/v1/finance/sip-calculator',
  visibility: 'public',
  featured: true,
  experimental: false,
  interfaces: { api: true, cli: true, web: true, mcp: false, npm: true },
  complexity: 'O(1)',
  estimatedMs: 0.1,
  requiresAuth: false,
  relatedTools: ['compound-interest', 'loan-calculator'],
  githubPath: 'packages/finance/src/sip-calculator',
  inputs: [
    { name: 'monthlyInvestment', label: 'Monthly Investment', type: 'number', unit: '₹' },
    { name: 'annualRatePercent', label: 'Expected Return', type: 'number', unit: '% p.a.' },
    { name: 'tenureMonths', label: 'Investment Period', type: 'number', unit: 'months' },
  ],
  outputs: [
    { name: 'futureValue', label: 'Future Value', type: 'number', unit: '₹' },
    { name: 'totalInvested', label: 'Total Invested', type: 'number', unit: '₹' },
    { name: 'estimatedReturns', label: 'Estimated Returns', type: 'number', unit: '₹' },
    { name: 'wealthRatio', label: 'Wealth Ratio', type: 'number', description: 'futureValue / totalInvested' },
  ],
  examples: [
    {
      label: '10 Year SIP',
      input: { monthlyInvestment: 10000, annualRatePercent: 12, tenureMonths: 120 },
      output: { futureValue: 2323390.49, totalInvested: 1200000, estimatedReturns: 1123390.49 },
    },
  ],
  changelog: [{ version: '0.1.0', date: '2025-01-01', changes: ['Initial release'] }],
};

export default manifest;
