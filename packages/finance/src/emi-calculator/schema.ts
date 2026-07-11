import { z } from 'zod';
import { positiveNumberSchema, positiveIntegerSchema } from '@toolbox/shared';

export const EMIInputSchema = z.object({
  principal: positiveNumberSchema.describe('Loan principal'),
  annualRatePercent: z.number().min(0).max(100).describe('Annual interest rate %'),
  tenureMonths: positiveIntegerSchema.describe('Tenure in months'),
});

export const EMIOutputSchema = z.object({
  emi: z.number(),
  totalAmount: z.number(),
  totalInterest: z.number(),
  monthlyRate: z.number(),
});

export type EMIInput = z.infer<typeof EMIInputSchema>;
export type EMIOutput = z.infer<typeof EMIOutputSchema>;
