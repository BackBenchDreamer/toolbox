import { describe, it, expect } from 'vitest';
import { calculateSIP } from './index.js';

describe('calculateSIP', () => {
  it('computes future value for 10-year SIP', () => {
    const result = calculateSIP({ monthlyInvestment: 10000, annualRatePercent: 12, tenureMonths: 120 });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.futureValue).toBeGreaterThan(1200000);
    expect(result.data.estimatedReturns).toBeGreaterThan(0);
    expect(result.data.wealthRatio).toBeGreaterThan(1);
  });

  it('handles 0% return rate (no growth)', () => {
    const result = calculateSIP({ monthlyInvestment: 1000, annualRatePercent: 0, tenureMonths: 12 });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.futureValue).toBeCloseTo(12000, 0);
  });

  it('fails for 0 monthly investment', () => {
    const result = calculateSIP({ monthlyInvestment: 0, annualRatePercent: 12, tenureMonths: 12 });
    expect(result.success).toBe(false);
  });
});
