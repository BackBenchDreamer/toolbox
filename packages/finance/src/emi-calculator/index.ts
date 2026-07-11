import { ok, err, ErrorCode, roundTo, computeEMI } from '@toolbox/shared';
import type { Result, Capability } from '@toolbox/shared';
import { EMIInputSchema } from './schema.js';
import type { EMIInput, EMIOutput } from './schema.js';
import manifest from './manifest.js';

export type { EMIInput, EMIOutput } from './schema.js';

/**
 * Calculate Equated Monthly Instalment (EMI).
 *
 * EMI = [P × r × (1+r)^n] / [(1+r)^n − 1]
 * P = principal, r = monthly rate, n = tenure months
 */
export function calculateEMI(input: EMIInput): Result<EMIOutput> {
  const parsed = EMIInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: ErrorCode.VALIDATION_ERROR, message: parsed.error.issues.map((i) => i.message).join('; ') });
  }

  const { principal, annualRatePercent, tenureMonths } = parsed.data;
  const monthlyRate = roundTo(annualRatePercent / 100 / 12, 8);
  const emi = roundTo(computeEMI(principal, annualRatePercent, tenureMonths), 2);
  const totalAmount = roundTo(emi * tenureMonths, 2);
  const totalInterest = roundTo(totalAmount - principal, 2);

  return ok({ emi, totalAmount, totalInterest, monthlyRate });
}

/** EMICalculator — Capability implementation wrapping calculateEMI(). */
export const EMICalculator: Capability<EMIInput, EMIOutput> = {
  manifest,
  execute: (input) => Promise.resolve(calculateEMI(input)),
};
