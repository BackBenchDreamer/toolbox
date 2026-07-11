import { describe, it, expect } from 'vitest';
import { generatePassword } from './index.js';

describe('generatePassword', () => {
  it('generates a password of the requested length', () => {
    const result = generatePassword({ length: 20, includeLowercase: true, includeUppercase: true, includeNumbers: true, includeSymbols: false, excludeAmbiguous: false, count: 1 });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.passwords[0]).toHaveLength(20);
  });

  it('generates multiple passwords', () => {
    const result = generatePassword({ length: 12, includeLowercase: true, includeUppercase: false, includeNumbers: false, includeSymbols: false, excludeAmbiguous: false, count: 5 });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.passwords).toHaveLength(5);
  });

  it('computes entropy > 0', () => {
    const result = generatePassword({ length: 16, includeLowercase: true, includeUppercase: true, includeNumbers: true, includeSymbols: true, excludeAmbiguous: false, count: 1 });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.entropy).toBeGreaterThan(0);
  });

  it('classifies a 16-char full-charset password as strong or very-strong', () => {
    const result = generatePassword({ length: 16, includeLowercase: true, includeUppercase: true, includeNumbers: true, includeSymbols: true, excludeAmbiguous: false, count: 1 });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(['strong', 'very-strong']).toContain(result.data.strength);
  });

  it('fails when no character sets are selected', () => {
    const result = generatePassword({ length: 12, includeLowercase: false, includeUppercase: false, includeNumbers: false, includeSymbols: false, excludeAmbiguous: false, count: 1 });
    expect(result.success).toBe(false);
  });

  it('fails for length below minimum', () => {
    const result = generatePassword({ length: 2, includeLowercase: true, includeUppercase: false, includeNumbers: false, includeSymbols: false, excludeAmbiguous: false, count: 1 });
    expect(result.success).toBe(false);
  });
});
