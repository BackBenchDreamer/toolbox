import { describe, it, expect } from 'vitest';
import { calculateLoan } from './index.js';

const BASE = { principal: 100000, annualRatePercent: 10, tenureMonths: 12 };

describe('calculateLoan — core', () => {
  it('calculates EMI correctly for a standard loan', () => {
    const r = calculateLoan(BASE);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.emi).toBeCloseTo(8791.59, 1);
    expect(r.data.totalPayment).toBeGreaterThan(100000);
    expect(r.data.totalInterest).toBeGreaterThan(0);
  });

  it('handles 0% interest rate', () => {
    const r = calculateLoan({ principal: 120000, annualRatePercent: 0, tenureMonths: 12 });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.emi).toBeCloseTo(10000, 0);
  });

  it('returns validation error for negative principal', () => {
    const r = calculateLoan({ ...BASE, principal: -1000 });
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns validation error for zero tenure', () => {
    const r = calculateLoan({ ...BASE, tenureMonths: 0 });
    expect(r.success).toBe(false);
  });
});

describe('calculateLoan — always-present fields', () => {
  it('interestPercent is always present', () => {
    const r = calculateLoan(BASE);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(typeof r.data.interestPercent).toBe('number');
    expect(r.data.interestPercent).toBeGreaterThan(0);
    expect(r.data.interestPercent).toBeLessThan(100);
  });

  it('warnings is always an array', () => {
    const r = calculateLoan(BASE);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(Array.isArray(r.data.warnings)).toBe(true);
  });

  it('recommendations is always an array', () => {
    const r = calculateLoan(BASE);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(Array.isArray(r.data.recommendations)).toBe(true);
  });
});

describe('calculateLoan — warnings', () => {
  it('HIGH_INTEREST_RATIO when interest > principal', () => {
    // High rate + very long tenure → interest > principal
    const r = calculateLoan({ principal: 100000, annualRatePercent: 12, tenureMonths: 360 });
    expect(r.success).toBe(true);
    if (!r.success) return;
    const codes = r.data.warnings.map((w) => w.code);
    expect(codes).toContain('HIGH_INTEREST_RATIO');
  });

  it('LONG_TENURE when tenure > 240 months', () => {
    const r = calculateLoan({ principal: 100000, annualRatePercent: 5, tenureMonths: 300 });
    expect(r.success).toBe(true);
    if (!r.success) return;
    const codes = r.data.warnings.map((w) => w.code);
    expect(codes).toContain('LONG_TENURE');
  });

  it('no warnings for short low-rate loan', () => {
    const r = calculateLoan({ principal: 100000, annualRatePercent: 5, tenureMonths: 24 });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.warnings).toHaveLength(0);
  });
});

describe('calculateLoan — amortisation schedule', () => {
  it('generates schedule when requested', () => {
    const r = calculateLoan({ ...BASE, includeSchedule: true });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.schedule).toHaveLength(12);
    const last = r.data.schedule![11]!;
    expect(last.balance).toBeCloseTo(0, 0);
  });

  it('schedule rows include cumPrincipal and cumInterest', () => {
    const r = calculateLoan({ ...BASE, includeSchedule: true });
    expect(r.success).toBe(true);
    if (!r.success) return;
    const first = r.data.schedule![0]!;
    expect(typeof first.cumPrincipal).toBe('number');
    expect(typeof first.cumInterest).toBe('number');
    // First row cumPrincipal equals its own principal component
    expect(first.cumPrincipal).toBeCloseTo(first.principal, 1);
    expect(first.cumInterest).toBeCloseTo(first.interest, 1);
  });

  it('schedule not included when not requested', () => {
    const r = calculateLoan(BASE);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.schedule).toBeUndefined();
  });
});

describe('calculateLoan — yearly summary', () => {
  it('computes yearly summary when requested', () => {
    const r = calculateLoan({ ...BASE, tenureMonths: 24, includeYearlySummary: true });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.yearlySummary).toHaveLength(2); // 24 months → 2 years
    const y1 = r.data.yearlySummary![0]!;
    expect(y1.year).toBe(1);
    expect(y1.closingBalance).toBeGreaterThan(0);
  });

  it('yearlySummary absent when not requested', () => {
    const r = calculateLoan(BASE);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.yearlySummary).toBeUndefined();
  });
});

describe('calculateLoan — chartData', () => {
  it('computes chart data when requested', () => {
    const r = calculateLoan({ ...BASE, includeChartData: true });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.chartData?.months).toHaveLength(12);
    expect(r.data.chartData?.balance).toHaveLength(12);
    expect(r.data.chartData?.interestPaid).toHaveLength(12);
    expect(r.data.chartData?.principalPaid).toHaveLength(12);
  });

  it('chartData absent when not requested', () => {
    const r = calculateLoan(BASE);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.chartData).toBeUndefined();
  });
});

describe('calculateLoan — explanation', () => {
  it('computes explanation when requested', () => {
    const r = calculateLoan({ ...BASE, includeExplanation: true });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.explanation?.formula).toContain('EMI =');
    expect(r.data.explanation?.substituted).toContain('100000');
    expect(r.data.explanation?.steps).toHaveLength(5);
  });

  it('explanation absent when not requested', () => {
    const r = calculateLoan(BASE);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.explanation).toBeUndefined();
  });
});

describe('calculateLoan — payoffDate', () => {
  it('computes payoffDate when startDate provided', () => {
    const r = calculateLoan({ ...BASE, startDate: '2025-01-15' });
    expect(r.success).toBe(true);
    if (!r.success) return;
    // 12 months from 2025-01-15 → 2026-01-15
    expect(r.data.payoffDate).toBe('2026-01-15');
  });

  it('payoffDate absent when startDate not provided', () => {
    const r = calculateLoan(BASE);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.payoffDate).toBeUndefined();
  });

  it('rejects invalid startDate format', () => {
    const r = calculateLoan({ ...BASE, startDate: '15-01-2025' });
    expect(r.success).toBe(false);
  });
});
