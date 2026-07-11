import { describe, it, expect } from 'vitest';
import { calculateEMI } from './index.js';

describe('calculateEMI', () => {
  it('calculates EMI for a car loan', () => {
    const result = calculateEMI({ principal: 800000, annualRatePercent: 9, tenureMonths: 60 });
    expect(result.success).toBe(true);
    if (!result.success) return;
    // Verified: 800000 × (0.0075 × 1.0075^60) / (1.0075^60 − 1) ≈ 16606.68
    expect(result.data.emi).toBeCloseTo(16606.68, 0);
  });

  it('returns 0 interest for 0% rate', () => {
    const result = calculateEMI({ principal: 120000, annualRatePercent: 0, tenureMonths: 12 });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.totalInterest).toBeCloseTo(0, 0);
  });

  it('fails for negative principal', () => {
    const result = calculateEMI({ principal: -100, annualRatePercent: 10, tenureMonths: 12 });
    expect(result.success).toBe(false);
  });
});
