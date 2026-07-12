import { describe, it, expect } from 'vitest';
import { simulatePrepayment } from './prepayment.js';

const BASE = {
  principal: 500000,
  annualRatePercent: 10,
  tenureMonths: 60,
};

describe('simulatePrepayment', () => {
  it('reduces tenure with a single prepayment', () => {
    const r = simulatePrepayment({
      ...BASE,
      prepayments: [{ month: 12, amount: 50000 }],
    });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.newTenureMonths).toBeLessThan(60);
    expect(r.data.monthsSaved).toBeGreaterThan(0);
  });

  it('saves interest with a single prepayment', () => {
    const r = simulatePrepayment({
      ...BASE,
      prepayments: [{ month: 6, amount: 100000 }],
    });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.interestSaved).toBeGreaterThan(0);
    expect(r.data.newTotalInterest).toBeLessThan(r.data.originalTotalInterest);
  });

  it('schedule length equals newTenureMonths', () => {
    const r = simulatePrepayment({
      ...BASE,
      prepayments: [{ month: 1, amount: 200000 }],
    });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.schedule).toHaveLength(r.data.newTenureMonths);
  });

  it('prepayment appears in schedule row', () => {
    const r = simulatePrepayment({
      ...BASE,
      prepayments: [{ month: 3, amount: 50000 }],
    });
    expect(r.success).toBe(true);
    if (!r.success) return;
    const row = r.data.schedule.find((row) => row.month === 3);
    expect(row?.prepayment).toBeGreaterThan(0);
  });

  it('multiple prepayments accumulate savings', () => {
    const single = simulatePrepayment({ ...BASE, prepayments: [{ month: 12, amount: 50000 }] });
    const double = simulatePrepayment({
      ...BASE,
      prepayments: [{ month: 6, amount: 50000 }, { month: 12, amount: 50000 }],
    });
    expect(single.success && double.success).toBe(true);
    if (!single.success || !double.success) return;
    expect(double.data.interestSaved).toBeGreaterThan(single.data.interestSaved);
  });

  it('returns validation error with no prepayments', () => {
    const r = simulatePrepayment({ ...BASE, prepayments: [] });
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns validation error for negative principal', () => {
    const r = simulatePrepayment({ ...BASE, principal: -1, prepayments: [{ month: 1, amount: 1000 }] });
    expect(r.success).toBe(false);
  });
});
