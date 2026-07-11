import { describe, it, expect } from 'vitest';
import { compoundInterestAmount, computeEMI, computeSIPFutureValue, percentOf } from './math/index.js';
import { roundTo, formatCurrency, clamp } from './formatting/index.js';
import { ok, err, isOk, isErr } from './errors/index.js';

describe('math utilities', () => {
  it('compoundInterestAmount: ₹1L at 10% for 2 years annually', () => {
    expect(compoundInterestAmount(100000, 10, 2, 1)).toBeCloseTo(121000, 0);
  });

  it('computeEMI: 0% rate divides evenly', () => {
    expect(computeEMI(120000, 0, 12)).toBeCloseTo(10000, 0);
  });

  it('computeSIPFutureValue: grows beyond invested', () => {
    const fv = computeSIPFutureValue(1000, 12, 12);
    expect(fv).toBeGreaterThan(12000);
  });

  it('percentOf returns correct fraction', () => {
    expect(percentOf(18, 10000)).toBe(1800);
  });
});

describe('formatting utilities', () => {
  it('roundTo: rounds to 2 decimal places', () => {
    expect(roundTo(1.555, 2)).toBe(1.56);
    expect(roundTo(1.234567, 3)).toBe(1.235);
  });

  it('clamp: constrains value within range', () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it('formatCurrency: formats INR correctly', () => {
    const s = formatCurrency(100000);
    expect(s).toContain('1,00,000');
  });
});

describe('result helpers', () => {
  it('ok creates a success result', () => {
    const r = ok(42);
    expect(r.success).toBe(true);
    expect(isOk(r)).toBe(true);
    expect(isErr(r)).toBe(false);
    if (r.success) expect(r.data).toBe(42);
  });

  it('err creates a failure result', () => {
    const r = err({ code: 'TEST', message: 'Test error' });
    expect(r.success).toBe(false);
    expect(isErr(r)).toBe(true);
    expect(isOk(r)).toBe(false);
  });
});
