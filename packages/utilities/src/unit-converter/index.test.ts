import { describe, it, expect } from 'vitest';
import { convertUnit } from './index.js';

describe('convertUnit', () => {
  it('converts km to miles', () => {
    const result = convertUnit({ value: 1, from: 'km', to: 'mi' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.value).toBeCloseTo(0.621371, 4);
  });

  it('converts Celsius to Fahrenheit', () => {
    const result = convertUnit({ value: 0, from: 'C', to: 'F' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.value).toBeCloseTo(32, 5);
  });

  it('converts 100°F to Celsius', () => {
    const result = convertUnit({ value: 100, from: 'F', to: 'C' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.value).toBeCloseTo(37.778, 2);
  });

  it('converts kg to pounds', () => {
    const result = convertUnit({ value: 1, from: 'kg', to: 'lb' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.value).toBeCloseTo(2.20462, 3);
  });

  it('converts GB to MB', () => {
    const result = convertUnit({ value: 1, from: 'GB', to: 'MB' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.value).toBe(1024);
  });

  it('returns identity conversion for same unit', () => {
    const result = convertUnit({ value: 42, from: 'm', to: 'm' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.value).toBe(42);
  });

  it('fails when crossing incompatible categories', () => {
    const result = convertUnit({ value: 10, from: 'km', to: 'kg' });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe('INVALID_INPUT');
  });

  it('fails for unknown unit key', () => {
    const result = convertUnit({ value: 1, from: 'xyz', to: 'm' });
    expect(result.success).toBe(false);
  });
});
