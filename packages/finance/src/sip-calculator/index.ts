import { ok, err, ErrorCode, roundTo, computeSIPFutureValue } from '@toolbox/shared';
import type { Result, Capability } from '@toolbox/shared';
import { SIPInputSchema } from './schema.js';
import type { SIPInput, SIPOutput } from './schema.js';
import manifest from './manifest.js';

export type { SIPInput, SIPOutput } from './schema.js';

/**
 * Calculate Systematic Investment Plan (SIP) future value.
 *
 * FV = P × [(1+r)^n − 1] / r × (1+r)
 * where r = monthly rate, n = months, P = monthly investment
 *
 * Time complexity: O(1)
 */
export function calculateSIP(input: SIPInput): Result<SIPOutput> {
  const parsed = SIPInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: ErrorCode.VALIDATION_ERROR, message: parsed.error.issues.map((i) => i.message).join('; ') });
  }

  const { monthlyInvestment, annualRatePercent, tenureMonths } = parsed.data;
  const futureValue = roundTo(computeSIPFutureValue(monthlyInvestment, annualRatePercent, tenureMonths), 2);
  const totalInvested = roundTo(monthlyInvestment * tenureMonths, 2);
  const estimatedReturns = roundTo(futureValue - totalInvested, 2);
  const wealthRatio = roundTo(futureValue / totalInvested, 4);

  return ok({ futureValue, totalInvested, estimatedReturns, wealthRatio });
}

/** SIPCalculator — Capability implementation wrapping calculateSIP(). */
export const SIPCalculator: Capability<SIPInput, SIPOutput> = {
  manifest,
  execute: (input) => Promise.resolve(calculateSIP(input)),
};
