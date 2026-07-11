import { z } from 'zod';
import { ok, err, ErrorCode, roundTo } from '@toolbox/shared';
import { computeEMI } from '@toolbox/shared';
import type { Result } from '@toolbox/shared';
import { positiveNumberSchema, positiveIntegerSchema } from '@toolbox/shared';

// ─── Schema ───────────────────────────────────────────────────────────────────

export const ReverseLoanInputSchema = z.object({
  emi: positiveNumberSchema.describe('Known monthly EMI'),
  annualRatePercent: z
    .number()
    .min(0, 'Rate must be 0 or greater')
    .max(100, 'Rate must be at most 100')
    .describe('Annual interest rate as percentage'),
  tenureMonths: positiveIntegerSchema.describe('Loan tenure in months'),
});

export const ReverseLoanOutputSchema = z.object({
  principal: z.number().describe('Derived loan principal'),
  totalPayment: z.number(),
  totalInterest: z.number(),
  interestPercent: z.number(),
});

export type ReverseLoanInput = z.input<typeof ReverseLoanInputSchema>;
export type ReverseLoanOutput = z.infer<typeof ReverseLoanOutputSchema>;

// ─── Function ─────────────────────────────────────────────────────────────────

/**
 * Given a known EMI, interest rate, and tenure, derive the original principal.
 *
 * Rearranged EMI formula: P = EMI × [(1+r)^n − 1] / [r × (1+r)^n]
 * (or P = EMI × n when rate is 0)
 */
export function calculateReverseLoan(input: ReverseLoanInput): Result<ReverseLoanOutput> {
  const parsed = ReverseLoanInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: ErrorCode.VALIDATION_ERROR,
      message: parsed.error.issues.map((i) => i.message).join('; '),
    });
  }

  const { emi, annualRatePercent, tenureMonths } = parsed.data;

  // Verify the EMI is consistent: EMI must be at least principal/n (0% case)
  // We don't gate on this — we just derive and return.
  let principal: number;

  if (annualRatePercent === 0) {
    principal = roundTo(emi * tenureMonths, 2);
  } else {
    const r = annualRatePercent / 100 / 12;
    const pow = Math.pow(1 + r, tenureMonths);
    principal = roundTo((emi * (pow - 1)) / (r * pow), 2);
  }

  // Cross-check: forward EMI from derived principal should match input EMI
  const forwardEmi = roundTo(computeEMI(principal, annualRatePercent, tenureMonths), 2);
  if (Math.abs(forwardEmi - emi) > 1) {
    return err({
      code: ErrorCode.INVALID_INPUT,
      message: `Derived principal (${principal}) does not round-trip to the given EMI (${emi}). Check inputs.`,
    });
  }

  const totalPayment = roundTo(emi * tenureMonths, 2);
  const totalInterest = roundTo(totalPayment - principal, 2);
  const interestPercent = roundTo((totalInterest / totalPayment) * 100, 4);

  return ok({ principal, totalPayment, totalInterest, interestPercent });
}
