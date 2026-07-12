import { describe, it, expect } from 'vitest';
import { calculateReverseLoan } from './reverse-loan.js';
import { calculateLoan } from './index.js';

describe('calculateReverseLoan', () => {
  it('derives principal from known EMI (round-trip)', () => {
    // First compute forward
    const forward = calculateLoan({ principal: 500000, annualRatePercent: 8.5, tenureMonths: 120 });
    expect(forward.success).toBe(true);
    if (!forward.success) return;

    // Then reverse with the computed EMI
    const reverse = calculateReverseLoan({
      emi: forward.data.emi,
      annualRatePercent: 8.5,
      tenureMonths: 120,
    });
    expect(reverse.success).toBe(true);
    if (!reverse.success) return;
    expect(reverse.data.principal).toBeCloseTo(500000, -2); // within ₹100
  });

  it('handles 0% interest rate', () => {
    const r = calculateReverseLoan({ emi: 10000, annualRatePercent: 0, tenureMonths: 12 });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.principal).toBeCloseTo(120000, 0);
  });

  it('returns validation error for zero EMI', () => {
    const r = calculateReverseLoan({ emi: 0, annualRatePercent: 8.5, tenureMonths: 120 });
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns validation error for negative rate', () => {
    const r = calculateReverseLoan({ emi: 10000, annualRatePercent: -1, tenureMonths: 12 });
    expect(r.success).toBe(false);
  });

  it('totalInterest is non-negative', () => {
    const r = calculateReverseLoan({ emi: 9000, annualRatePercent: 10, tenureMonths: 12 });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.totalInterest).toBeGreaterThanOrEqual(0);
  });
});
