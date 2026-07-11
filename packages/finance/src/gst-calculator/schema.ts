import { z } from 'zod';
import { positiveNumberSchema } from '@toolbox/shared';

export type GSTMode = 'exclusive' | 'inclusive';

export const GSTInputSchema = z.object({
  amount: positiveNumberSchema.describe('Base amount or amount inclusive of GST'),
  gstPercent: z
    .number()
    .min(0)
    .max(100)
    .describe('GST rate as percentage (e.g. 18 for 18%)'),
  mode: z
    .enum(['exclusive', 'inclusive'])
    .default('exclusive')
    .describe('"exclusive" = GST added to amount; "inclusive" = GST extracted from amount'),
});

export const GSTOutputSchema = z.object({
  baseAmount: z.number(),
  gstAmount: z.number(),
  totalAmount: z.number(),
  cgst: z.number().describe('CGST = gstAmount / 2'),
  sgst: z.number().describe('SGST = gstAmount / 2'),
  effectiveRate: z.number(),
});

export type GSTInput = z.infer<typeof GSTInputSchema>;
export type GSTOutput = z.infer<typeof GSTOutputSchema>;
