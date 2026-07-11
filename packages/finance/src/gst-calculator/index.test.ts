import { describe, it, expect } from 'vitest';
import { calculateGST } from './index.js';

describe('calculateGST', () => {
  it('calculates exclusive GST correctly', () => {
    const result = calculateGST({ amount: 10000, gstPercent: 18, mode: 'exclusive' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.gstAmount).toBe(1800);
    expect(result.data.totalAmount).toBe(11800);
    expect(result.data.cgst).toBe(900);
    expect(result.data.sgst).toBe(900);
  });

  it('calculates inclusive GST correctly', () => {
    const result = calculateGST({ amount: 11800, gstPercent: 18, mode: 'inclusive' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.baseAmount).toBeCloseTo(10000, 0);
    expect(result.data.gstAmount).toBeCloseTo(1800, 0);
  });

  it('handles 0% GST', () => {
    const result = calculateGST({ amount: 5000, gstPercent: 0, mode: 'exclusive' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.gstAmount).toBe(0);
    expect(result.data.totalAmount).toBe(5000);
  });

  it('fails for negative amount', () => {
    const result = calculateGST({ amount: -100, gstPercent: 18, mode: 'exclusive' });
    expect(result.success).toBe(false);
  });
});
