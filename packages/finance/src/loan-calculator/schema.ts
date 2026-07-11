import { z } from 'zod';
import { positiveNumberSchema, positiveIntegerSchema } from '@toolbox/shared';

export const LoanInputSchema = z.object({
  principal: positiveNumberSchema.describe('Loan principal amount'),
  annualRatePercent: z
    .number()
    .min(0, 'Rate must be 0 or greater')
    .max(100, 'Rate must be at most 100')
    .describe('Annual interest rate as percentage'),
  tenureMonths: positiveIntegerSchema.describe('Loan tenure in months'),
  includeSchedule: z.boolean().optional().default(false).describe('Include full amortisation schedule'),
});

export const AmortisationRowSchema = z.object({
  month: z.number().int().positive(),
  emi: z.number(),
  principal: z.number(),
  interest: z.number(),
  balance: z.number(),
});

export const LoanOutputSchema = z.object({
  emi: z.number().describe('Monthly EMI'),
  totalPayment: z.number().describe('Total amount paid over tenure'),
  totalInterest: z.number().describe('Total interest paid'),
  schedule: z.array(AmortisationRowSchema).optional(),
});

export type LoanInput = z.infer<typeof LoanInputSchema>;
export type LoanOutput = z.infer<typeof LoanOutputSchema>;
export type AmortisationRow = z.infer<typeof AmortisationRowSchema>;
