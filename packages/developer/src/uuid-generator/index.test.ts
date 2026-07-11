import { describe, it, expect } from 'vitest';
import { generateUUID } from './index.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
