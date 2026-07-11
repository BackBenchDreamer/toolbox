import { z } from 'zod';
import { positiveNumberSchema, positiveIntegerSchema } from '@toolbox/shared';

export const CompoundInterestInputSchema = z.object({
  principal: positiveNumberSchema.describe('Initial investment amount'),
  annualRatePercent: z.number().min(0).max(100).describe('Annual interest rate %'),
  years: positiveIntegerSchema.describe('Investment period in years'),
  compoundingsPerYear: z
    .number()
    .int()
    .min(1)
    .max(365)
    .default(1)
    .describe('Number of times compounded per year (1=annually, 12=monthly, 365=daily)'),
});

export const CompoundInterestOutputSchema = z.object({
  futureValue: z.number(),
  totalInterest: z.number(),
  effectiveAnnualRate: z.number().describe('EAR = (1 + r/n)^n − 1'),
});

export type CompoundInterestInput = z.infer<typeof CompoundInterestInputSchema>;
export type CompoundInterestOutput = z.infer<typeof CompoundInterestOutputSchema>;
