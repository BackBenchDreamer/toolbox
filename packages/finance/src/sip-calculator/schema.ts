import { z } from 'zod';
import { positiveNumberSchema, positiveIntegerSchema } from '@toolbox/shared';

export const SIPInputSchema = z.object({
  monthlyInvestment: positiveNumberSchema.describe('Amount invested every month'),
  annualRatePercent: z.number().min(0).max(100).describe('Expected annual return %'),
  tenureMonths: positiveIntegerSchema.describe('Investment period in months'),
});

export const SIPOutputSchema = z.object({
  futureValue: z.number(),
  totalInvested: z.number(),
  estimatedReturns: z.number(),
  wealthRatio: z.number().describe('futureValue / totalInvested'),
});

export type SIPInput = z.infer<typeof SIPInputSchema>;
export type SIPOutput = z.infer<typeof SIPOutputSchema>;
