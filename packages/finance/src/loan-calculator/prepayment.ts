import { z } from 'zod';
import { ok, err, ErrorCode, roundTo } from '@toolbox/shared';
import { computeEMI } from '@toolbox/shared';
import type { Result } from '@toolbox/shared';
import { positiveNumberSchema, positiveIntegerSchema } from '@toolbox/shared';

// ─── Schema ───────────────────────────────────────────────────────────────────

export const PrepaymentEventSchema = z.object({
  /** Month number (1-based) at which the prepayment is made */
  month: positiveIntegerSchema,
  /** Lump-sum amount paid in addition to regular EMI */
  amount: positiveNumberSchema,
});

export const PrepaymentInputSchema = z.object({
  principal: positiveNumberSchema,
  annualRatePercent: z
    .number()
    .min(0, 'Rate must be 0 or greater')
    .max(100, 'Rate must be at most 100'),
  tenureMonths: positiveIntegerSchema,
  prepayments: z
    .array(PrepaymentEventSchema)
    .min(1, 'At least one prepayment event is required'),
});

export const PrepaymentOutputSchema = z.object({
  originalEmi: z.number(),
  originalTotalInterest: z.number(),
  originalTenureMonths: z.number(),
  newTenureMonths: z.number().describe('Actual months until payoff'),
  newTotalInterest: z.number(),
  interestSaved: z.number(),
  monthsSaved: z.number(),
  schedule: z.array(
    z.object({
      month: z.number(),
      emi: z.number(),
      principal: z.number(),
      interest: z.number(),
      prepayment: z.number(),
      balance: z.number(),
    }),
  ),
});

export type PrepaymentEvent = z.infer<typeof PrepaymentEventSchema>;
export type PrepaymentInput = z.input<typeof PrepaymentInputSchema>;
export type PrepaymentOutput = z.infer<typeof PrepaymentOutputSchema>;

// ─── Function ─────────────────────────────────────────────────────────────────

/**
 * Simulate the effect of one or more lump-sum prepayments on a standard loan.
 *
 * Strategy: after each prepayment, the outstanding balance is reduced.
 * The EMI stays the same — the loan terminates earlier.
 */
export function simulatePrepayment(input: PrepaymentInput): Result<PrepaymentOutput> {
  const parsed = PrepaymentInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: ErrorCode.VALIDATION_ERROR,
      message: parsed.error.issues.map((i) => i.message).join('; '),
    });
  }

  const { principal, annualRatePercent, tenureMonths, prepayments } = parsed.data;

  const emi = roundTo(computeEMI(principal, annualRatePercent, tenureMonths), 2);
  const originalTotalPayment = roundTo(emi * tenureMonths, 2);
  const originalTotalInterest = roundTo(originalTotalPayment - principal, 2);

  const r = annualRatePercent / 100 / 12;
  const prepaymentMap = new Map(prepayments.map((p) => [p.month, p.amount]));

  let balance = principal;
  let totalInterestPaid = 0;
  const schedule: PrepaymentOutput['schedule'] = [];

  for (let month = 1; month <= tenureMonths && balance > 0; month++) {
    const interest = roundTo(balance * r, 2);
    const principalPaid = roundTo(Math.min(emi - interest, balance), 2);
    const prepayment = roundTo(Math.min(prepaymentMap.get(month) ?? 0, balance - principalPaid), 2);
    balance = roundTo(Math.max(0, balance - principalPaid - prepayment), 2);
    totalInterestPaid = roundTo(totalInterestPaid + interest, 2);

    schedule.push({ month, emi, principal: principalPaid, interest, prepayment, balance });

    if (balance === 0) break;
  }

  const newTenureMonths = schedule.length;
  const newTotalInterest = totalInterestPaid;
  const interestSaved = roundTo(originalTotalInterest - newTotalInterest, 2);
  const monthsSaved = tenureMonths - newTenureMonths;

  return ok({
    originalEmi: emi,
    originalTotalInterest,
    originalTenureMonths: tenureMonths,
    newTenureMonths,
    newTotalInterest,
    interestSaved,
    monthsSaved,
    schedule,
  });
}

