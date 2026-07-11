import { z } from 'zod';

export const PasswordInputSchema = z.object({
  length: z
    .number()
    .int()
    .min(4, 'Minimum length is 4')
    .max(256, 'Maximum length is 256')
    .default(16),
  includeLowercase: z.boolean().default(true),
  includeUppercase: z.boolean().default(true),
  includeNumbers: z.boolean().default(true),
  includeSymbols: z.boolean().default(false),
  excludeAmbiguous: z
    .boolean()
    .default(false)
    .describe('Exclude visually ambiguous characters: 0, O, l, 1, I'),
  count: z.number().int().min(1).max(100).default(1).describe('Number of passwords to generate'),
});

export type PasswordInput = z.infer<typeof PasswordInputSchema>;

export interface PasswordOutput {
  passwords: string[];
  entropy: number;
  strength: 'weak' | 'fair' | 'strong' | 'very-strong';
}
