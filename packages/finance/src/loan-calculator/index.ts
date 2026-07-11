import { ok, err, ErrorCode, roundTo } from '@toolbox/shared';
import { computeEMI } from '@toolbox/shared';
import type { Result, Capability } from '@toolbox/shared';
import { LoanInputSchema } from './schema.js';
import type { LoanInput, LoanOutput, AmortisationRow } from './schema.js';
import manifest from './manifest.js';

export type { LoanInput, LoanOutput, AmortisationRow } from './schema.js';

/**
 * Calculate loan repayment details.
 *
 * Formula: EMI = [P × r × (1+r)^n] / [(1+r)^n − 1]
 * where r = monthly rate, n = tenure in months
 *
 * Time complexity: O(n) when schedule is requested, O(1) otherwise.
 */
export function calculateLoan(input: LoanInput): Result<LoanOutput> {
  const parsed = LoanInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: ErrorCode.VALIDATION_ERROR,
      message: parsed.error.issues.map((i) => i.message).join('; '),
    });
  }

  const { principal, annualRatePercent, tenureMonths, includeSchedule } = parsed.data;

  const emi = roundTo(computeEMI(principal, annualRatePercent, tenureMonths), 2);
  const totalPayment = roundTo(emi * tenureMonths, 2);
  const totalInterest = roundTo(totalPayment - principal, 2);

  let schedule: AmortisationRow[] | undefined;

  if (includeSchedule) {
    schedule = buildAmortisationSchedule(principal, annualRatePercent, tenureMonths, emi);
  }

  return ok({ emi, totalPayment, totalInterest, schedule });
}

/**
 * LoanCalculator — Capability implementation.
 *
 * Wraps calculateLoan() in the standard Capability<Input, Output> contract.
 * Use this as the canonical reference when wiring API routes, CLI commands,
 * MCP tools, or any other adapter — the calculation layer remains unchanged.
 */
export const LoanCalculator: Capability<LoanInput, LoanOutput> = {
  manifest,
  execute: (input) => Promise.resolve(calculateLoan(input)),
};

/** Build a month-by-month amortisation schedule */
function buildAmortisationSchedule(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
  emi: number,
): AmortisationRow[] {
  const r = annualRatePercent / 100 / 12;
  let balance = principal;
  const rows: AmortisationRow[] = [];

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = roundTo(balance * r, 2);
    const principalPaid = roundTo(emi - interest, 2);
    balance = roundTo(Math.max(0, balance - principalPaid), 2);
    rows.push({ month, emi, principal: principalPaid, interest, balance });
  }

  return rows;
}
