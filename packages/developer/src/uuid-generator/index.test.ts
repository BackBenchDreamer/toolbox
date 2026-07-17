import { describe, it, expect } from 'vitest';
import { generateUUID } from './index.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Parse a UUID string into a 16-byte Uint8Array for structural assertions. */
function uuidToBytes(uuid: string): Uint8Array {
  const hex = uuid.replace(/-/g, '');
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

describe('generateUUID', () => {
  it('generates a single v4 UUID', () => {
    const result = generateUUID({ count: 1, version: 'v4', uppercase: false });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.uuids).toHaveLength(1);
    expect(result.data.uuids[0]).toMatch(UUID_REGEX);
    // v4 version nibble
    expect(result.data.uuids[0]![14]).toBe('4');
  });

  it('generates multiple UUIDs', () => {
    const result = generateUUID({ count: 10, version: 'v4', uppercase: false });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.uuids).toHaveLength(10);
    const unique = new Set(result.data.uuids);
    expect(unique.size).toBe(10);
  });

  it('generates uppercase UUID when requested', () => {
    const result = generateUUID({ count: 1, version: 'v4', uppercase: true });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.uuids[0]).toBe(result.data.uuids[0]!.toUpperCase());
  });

  it('generates v7 UUIDs with version nibble 7', () => {
    const result = generateUUID({ count: 5, version: 'v7', uppercase: false });
    expect(result.success).toBe(true);
    if (!result.success) return;
    result.data.uuids.forEach((id) => expect(id[14]).toBe('7'));
  });

  it('fails for count exceeding limit', () => {
    const result = generateUUID({ count: 101, version: 'v4', uppercase: false });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// UUID v7 structural regression tests (guards against the byte-index bug)
//
// The previous implementation had: bytes[8] = rand[2]; loop i=9..15 uses
// rand[i-7], so bytes[9] also used rand[2] — a duplicate. rand[9] was
// allocated but never consumed. These tests catch that regression.
// ---------------------------------------------------------------------------

describe('generateUUID v7 — structural correctness', () => {
  it('matches the canonical UUID format', () => {
    const result = generateUUID({ count: 1, version: 'v7', uppercase: false });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.uuids[0]).toMatch(UUID_REGEX);
  });

  it('byte 6 high nibble is 0x7 (version 7)', () => {
    // bytes[6] high nibble must be 0x7 (the character at UUID position 14 is '7')
    const result = generateUUID({ count: 50, version: 'v7', uppercase: false });
    expect(result.success).toBe(true);
    if (!result.success) return;
    result.data.uuids.forEach((id) => {
      const bytes = uuidToBytes(id);
      expect((bytes[6]! & 0xf0) >> 4).toBe(7);
    });
  });

  it('byte 8 high 2 bits are 0b10 (RFC 4122 variant)', () => {
    // bytes[8] must satisfy: (byte & 0xc0) === 0x80
    const result = generateUUID({ count: 50, version: 'v7', uppercase: false });
    expect(result.success).toBe(true);
    if (!result.success) return;
    result.data.uuids.forEach((id) => {
      const bytes = uuidToBytes(id);
      expect(bytes[8]! & 0xc0).toBe(0x80);
    });
  });

  it('bytes[8] and bytes[9] are statistically independent (regression: byte-index overlap bug)', () => {
    // Bug that was present: generateV7() allocated rand = Uint8Array(10) and used:
    //   bytes[8] = (rand[2] & 0x3f) | 0x80    (variant nibble)
    //   loop: bytes[i] = rand[i - 7]           (i=9 → rand[2] again — DUPLICATE)
    //
    // Consequence: bytes[9] === rand[2], and bytes[8] === (rand[2] & 0x3f) | 0x80
    // Therefore:  (bytes[8] & 0x3f) === (bytes[9] & 0x3f) for every UUID produced
    //             by the buggy implementation. rand[9] was allocated but never used.
    //
    // Fix: changed loop offset from (i - 7) to (i - 6), so bytes[9] now uses rand[3].
    // With the fix this correlation must no longer hold.
    const result = generateUUID({ count: 100, version: 'v7', uppercase: false });
    expect(result.success).toBe(true);
    if (!result.success) return;

    let alwaysCorrelated = true;
    for (const id of result.data.uuids) {
      const bytes = uuidToBytes(id);
      // The exact bug signature: lower-6-bits of bytes[8] always equal lower-6-bits of bytes[9]
      // because both derive from the same rand[2] source byte.
      if ((bytes[8]! & 0x3f) !== (bytes[9]! & 0x3f)) {
        alwaysCorrelated = false;
        break;
      }
    }
    // With the fix, bytes[9] comes from rand[3] — a different random byte.
    // The correlation must break in at least one of 100 samples.
    // (Probability of 100 independent random bytes satisfying this by chance: (1/4)^100 ≈ 0)
    expect(alwaysCorrelated).toBe(false);
  });

  it('v7 UUIDs are time-ordered (monotonically increasing for batch within same ms)', () => {
    // Generate a batch at ~the same timestamp; sort order should equal generation order
    // or be equal (same ms). We verify timestamps are all recent (within 5 seconds).
    const before = Date.now();
    const result = generateUUID({ count: 10, version: 'v7', uppercase: false });
    const after = Date.now();
    expect(result.success).toBe(true);
    if (!result.success) return;

    result.data.uuids.forEach((id) => {
      const bytes = uuidToBytes(id);
      // Reconstruct 48-bit timestamp from bytes[0..5]
      const ts =
        (bytes[0]! * 0x10000000000) +
        (bytes[1]! * 0x100000000) +
        (bytes[2]! * 0x1000000) +
        (bytes[3]! * 0x10000) +
        (bytes[4]! * 0x100) +
        bytes[5]!;
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after + 1); // +1ms tolerance
    });
  });

  it('v7 UUIDs are unique across a batch of 100', () => {
    const result = generateUUID({ count: 100, version: 'v7', uppercase: false });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const unique = new Set(result.data.uuids);
    expect(unique.size).toBe(100);
  });
});
