import { ok, err, ErrorCode, roundTo, compoundInterestAmount } from '@toolbox/shared';
import type { Result } from '@toolbox/shared';
import { CompoundInterestInputSchema } from './schema.js';
import type { CompoundInterestInput, CompoundInterestOutput } from './schema.js';

/**
 * Compound Interest Calculator.
 *
 * A = P(1 + r/n)^(nt)
 * EAR = (1 + r/n)^n − 1
 *
 * P = principal, r = annual rate, n = compoundings/year, t = years
 */
export function calculateCompoundInterest(input: CompoundInterestInput): Result<CompoundInterestOutput> {
  const parsed = CompoundInterestInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: ErrorCode.VALIDATION_ERROR, message: parsed.error.issues.map((i) => i.message).join('; ') });
  }

  const { principal, annualRatePercent, years, compoundingsPerYear } = parsed.data;
  const r = annualRatePercent / 100;
  const n = compoundingsPerYear;

  const futureValue = roundTo(compoundInterestAmount(principal, annualRatePercent, years, n), 2);
  const totalInterest = roundTo(futureValue - principal, 2);
  const effectiveAnnualRate = roundTo((Math.pow(1 + r / n, n) - 1) * 100, 4);

  return ok({ futureValue, totalInterest, effectiveAnnualRate });
}
