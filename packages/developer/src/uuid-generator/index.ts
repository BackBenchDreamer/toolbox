import { ok, err, ErrorCode } from '@toolbox/shared';
import type { Result } from '@toolbox/shared';
import { UUIDInputSchema } from './schema.js';
import type { UUIDInput, UUIDOutput } from './schema.js';
export type { UUIDInput, UUIDOutput } from './schema.js';

/**
 * UUID Generator — supports v4 (random) and v7 (time-ordered, sortable).
 *
 * v4: 122 bits of random data (RFC 4122).
 * v7: Unix timestamp ms in top 48 bits + random (draft-ietf-uuidrev-rfc4122bis).
 *
 * Uses crypto.randomUUID() for v4 when available.
 */
export function generateUUID(input: UUIDInput): Result<UUIDOutput> {
  const parsed = UUIDInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: ErrorCode.VALIDATION_ERROR, message: parsed.error.issues.map((i) => i.message).join('; ') });
  }

  const { count, version, uppercase } = parsed.data;

  const uuids = Array.from({ length: count }, () => {
    const id = version === 'v4' ? generateV4() : generateV7();
    return uppercase ? id.toUpperCase() : id;
  });

  return ok({ uuids, version });
}

function generateV4(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Polyfill for environments without crypto.randomUUID
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // variant 10xx
  return bytesToUUID(bytes);
}

function generateV7(): string {
  const bytes = new Uint8Array(16);
  const now = Date.now();

  // Top 48 bits = Unix ms timestamp
  const ms = BigInt(now);
  bytes[0] = Number((ms >> 40n) & 0xffn);
  bytes[1] = Number((ms >> 32n) & 0xffn);
  bytes[2] = Number((ms >> 24n) & 0xffn);
  bytes[3] = Number((ms >> 16n) & 0xffn);
  bytes[4] = Number((ms >> 8n) & 0xffn);
  bytes[5] = Number(ms & 0xffn);

  // Bits 48-51 = version 7; bits 52-63 = random
  const rand = new Uint8Array(10);
  globalThis.crypto.getRandomValues(rand);
  bytes[6] = ((rand[0]! & 0x0f) | 0x70); // version 7
  bytes[7] = rand[1]!;
  bytes[8] = ((rand[2]! & 0x3f) | 0x80); // variant
  for (let i = 9; i < 16; i++) bytes[i] = rand[i - 7]!;

  return bytesToUUID(bytes);
}

function bytesToUUID(b: Uint8Array): string {
  const hex = Array.from(b, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
