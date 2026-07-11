import { ok, err, ErrorCode } from '@toolbox/shared';
import type { Result, Capability } from '@toolbox/shared';
import { PasswordInputSchema } from './schema.js';
import type { PasswordInput, PasswordOutput } from './schema.js';
import manifest from './manifest.js';

export type { PasswordInput, PasswordOutput } from './schema.js';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = new Set(['0', 'O', 'l', '1', 'I', 'o']);

/**
 * Cryptographically secure password generator.
 * Uses crypto.getRandomValues (browser) / randomFillSync (Node) for entropy.
 *
 * Entropy = log2(charsetSize^length)
 */
export function generatePassword(input: PasswordInput): Result<PasswordOutput> {
  const parsed = PasswordInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: ErrorCode.VALIDATION_ERROR, message: parsed.error.issues.map((i) => i.message).join('; ') });
  }

  const { length, includeLowercase, includeUppercase, includeNumbers, includeSymbols, excludeAmbiguous, count } =
    parsed.data;

  if (!includeLowercase && !includeUppercase && !includeNumbers && !includeSymbols) {
    return err({ code: ErrorCode.INVALID_INPUT, message: 'At least one character set must be selected' });
  }

  let charset = '';
  if (includeLowercase) charset += LOWER;
  if (includeUppercase) charset += UPPER;
  if (includeNumbers) charset += DIGITS;
  if (includeSymbols) charset += SYMBOLS;

  if (excludeAmbiguous) {
    charset = charset.split('').filter((c) => !AMBIGUOUS.has(c)).join('');
  }

  const charsetSize = charset.length;
  const entropy = length * Math.log2(charsetSize);

  const passwords = Array.from({ length: count }, () => buildPassword(charset, length));
  const strength = classifyStrength(entropy);

  return ok({ passwords, entropy: Math.round(entropy * 100) / 100, strength });
}

function buildPassword(charset: string, length: number): string {
  const arr = new Uint32Array(length);
  if (typeof globalThis.crypto !== 'undefined') {
    globalThis.crypto.getRandomValues(arr);
  } else {
    // Node.js fallback
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomFillSync } = require('crypto') as typeof import('crypto');
    randomFillSync(arr);
  }
  return Array.from(arr, (n) => charset[n % charset.length]).join('');
}

function classifyStrength(entropy: number): PasswordOutput['strength'] {
  if (entropy < 40) return 'weak';
  if (entropy < 60) return 'fair';
  if (entropy < 80) return 'strong';
  return 'very-strong';
}

/** PasswordGenerator — Capability implementation wrapping generatePassword(). */
export const PasswordGenerator: Capability<PasswordInput, PasswordOutput> = {
  manifest,
  execute: (input) => Promise.resolve(generatePassword(input)),
};
