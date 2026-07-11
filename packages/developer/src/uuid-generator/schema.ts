import { z } from 'zod';

export type UUIDVersion = 'v4' | 'v7';

export const UUIDInputSchema = z.object({
  count: z.number().int().min(1).max(100).default(1).describe('How many UUIDs to generate'),
  version: z.enum(['v4', 'v7']).default('v4').describe('UUID version (v4=random, v7=time-ordered)'),
  uppercase: z.boolean().default(false),
});

export type UUIDInput = z.infer<typeof UUIDInputSchema>;

export interface UUIDOutput {
  uuids: string[];
  version: UUIDVersion;
}
