import { describe, it, expect } from 'vitest';
import { calculateLoan } from './index.js';

describe('calculateLoan', () => {
  it('calculates EMI correctly for a standard loan', () => {
    const result = calculateLoan({
      principal: 100000,
      annualRatePercent: 10,
      tenureMonths: 12,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.emi).toBeCloseTo(8791.59, 1);
    expect(result.data.totalPayment).toBeGreaterThan(100000);
    expect(result.data.totalInterest).toBeGreaterThan(0);
  });

  it('handles 0% interest rate', () => {
    const result = calculateLoan({
      principal: 120000,
      annualRatePercent: 0,
      tenureMonths: 12,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.emi).toBeCloseTo(10000, 0);
  });

  it('generates amortisation schedule when requested', () => {
    const result = calculateLoan({
      principal: 100000,
      annualRatePercent: 10,
      tenureMonths: 12,
      includeSchedule: true,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.schedule).toHaveLength(12);
    const lastRow = result.data.schedule?.[11];
    expect(lastRow?.balance).toBeCloseTo(0, 0);
  });

  it('returns validation error for negative principal', () => {
    const result = calculateLoan({
      principal: -1000,
      annualRatePercent: 10,
      tenureMonths: 12,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns validation error for zero tenure', () => {
    const result = calculateLoan({
      principal: 100000,
      annualRatePercent: 10,
      tenureMonths: 0,
    });
    expect(result.success).toBe(false);
  });
});
