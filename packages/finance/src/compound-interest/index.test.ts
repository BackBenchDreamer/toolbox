import { describe, it, expect } from 'vitest';
import { calculateCompoundInterest } from './index.js';

describe('calculateCompoundInterest', () => {
  it('calculates compound interest annually', () => {
    const result = calculateCompoundInterest({ principal: 100000, annualRatePercent: 10, years: 2, compoundingsPerYear: 1 });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.futureValue).toBeCloseTo(121000, 0);
  });

  it('calculates effective annual rate for monthly compounding', () => {
    const result = calculateCompoundInterest({ principal: 10000, annualRatePercent: 12, years: 1, compoundingsPerYear: 12 });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.effectiveAnnualRate).toBeGreaterThan(12);
  });

  it('fails for invalid year input', () => {
    const result = calculateCompoundInterest({ principal: 1000, annualRatePercent: 5, years: 0, compoundingsPerYear: 1 });
    expect(result.success).toBe(false);
  });
});
