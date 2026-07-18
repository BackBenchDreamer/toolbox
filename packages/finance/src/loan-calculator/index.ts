import { ok, err, ErrorCode, roundTo } from '@toolbox/shared';
import { computeEMI } from '@toolbox/shared';
import type { Result, Capability } from '@toolbox/shared';
import { LoanInputSchema } from './schema.js';
export { scheduleToCSV, outputToJSON } from './export.js';
export type { CSVOptions } from './export.js';
export { calculateReverseLoan } from './reverse-loan.js';
export type { ReverseLoanInput, ReverseLoanOutput } from './reverse-loan.js';
export { simulatePrepayment } from './prepayment.js';
export type { PrepaymentInput, PrepaymentOutput, PrepaymentEvent } from './prepayment.js';
import type {
  LoanInput,
  LoanOutput,
  AmortisationRow,
  YearlySummaryRow,
  LoanChartData,
  LoanExplanation,
  LoanWarning,
  LoanRecommendation,
} from './schema.js';
import manifest from './manifest.js';

export type {
  LoanInput,
  LoanOutput,
  AmortisationRow,
  YearlySummaryRow,
  LoanChartData,
  LoanExplanation,
  LoanWarning,
  LoanRecommendation,
} from './schema.js';

/**
 * Calculate loan repayment details.
 *
 * Formula: EMI = [P × r × (1+r)^n] / [(1+r)^n − 1]
 * where r = monthly rate, n = tenure in months
 *
 * Time complexity: O(n) when schedule/chart/summary requested, O(1) otherwise.
 */
export function calculateLoan(input: LoanInput): Result<LoanOutput> {
  const parsed = LoanInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: ErrorCode.VALIDATION_ERROR,
      message: parsed.error.issues.map((i) => i.message).join('; '),
    });
  }

  const {
    principal,
    annualRatePercent,
    tenureMonths,
    includeSchedule,
    includeYearlySummary,
    includeChartData,
    includeExplanation,
    startDate,
  } = parsed.data;

  const emi = roundTo(computeEMI(principal, annualRatePercent, tenureMonths), 2);
  const totalPayment = roundTo(emi * tenureMonths, 2);
  const totalInterest = roundTo(totalPayment - principal, 2);
  const interestPercent = roundTo((totalInterest / totalPayment) * 100, 4);

  // Always-computed warnings
  const warnings = computeWarnings(principal, totalInterest, tenureMonths);
  // Always-computed recommendations
  const recommendations = computeRecommendations(warnings, emi, annualRatePercent);

  // Amortisation schedule — needed for several conditional outputs
  const needsSchedule = includeSchedule || includeYearlySummary || includeChartData;
  const rows = needsSchedule
    ? buildAmortisationSchedule(principal, annualRatePercent, tenureMonths, emi)
    : undefined;

  const schedule = includeSchedule ? rows : undefined;
  const yearlySummary = includeYearlySummary && rows ? buildYearlySummary(rows) : undefined;
  const chartData = includeChartData && rows ? buildChartData(rows) : undefined;
  const explanation = includeExplanation
    ? buildExplanation(principal, annualRatePercent, tenureMonths, emi)
    : undefined;

  const payoffDate = startDate
    ? computePayoffDate(startDate, tenureMonths)
    : undefined;

  return ok({
    emi,
    totalPayment,
    totalInterest,
    interestPercent,
    warnings,
    recommendations,
    schedule,
    yearlySummary,
    chartData,
    explanation,
    payoffDate,
  });
}

/**
 * LoanCalculator — Capability implementation.
 */
export const LoanCalculator: Capability<LoanInput, LoanOutput> = {
  manifest,
  execute: (input) => Promise.resolve(calculateLoan(input)),
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Build a month-by-month amortisation schedule with cumulative columns */
function buildAmortisationSchedule(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
  emi: number,
): AmortisationRow[] {
  const r = annualRatePercent / 100 / 12;
  let balance = principal;
  let cumPrincipal = 0;
  let cumInterest = 0;
  const rows: AmortisationRow[] = [];

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = roundTo(balance * r, 2);
    const principalPaid = roundTo(emi - interest, 2);
    balance = roundTo(Math.max(0, balance - principalPaid), 2);
    cumPrincipal = roundTo(cumPrincipal + principalPaid, 2);
    cumInterest = roundTo(cumInterest + interest, 2);
    rows.push({ month, emi, principal: principalPaid, interest, balance, cumPrincipal, cumInterest });
  }

  return rows;
}

/** Build year-by-year summary from amortisation rows */
function buildYearlySummary(rows: AmortisationRow[]): YearlySummaryRow[] {
  const yearMap = new Map<number, YearlySummaryRow>();

  for (const row of rows) {
    const year = Math.ceil(row.month / 12);
    const existing = yearMap.get(year);
    if (!existing) {
      yearMap.set(year, {
        year,
        principalPaid: row.principal,
        interestPaid: row.interest,
        totalPaid: roundTo(row.principal + row.interest, 2),
        closingBalance: row.balance,
      });
    } else {
      existing.principalPaid = roundTo(existing.principalPaid + row.principal, 2);
      existing.interestPaid = roundTo(existing.interestPaid + row.interest, 2);
      existing.totalPaid = roundTo(existing.totalPaid + row.principal + row.interest, 2);
      existing.closingBalance = row.balance; // last row in year wins
    }
  }

  return [...yearMap.values()];
}

/** Build chart-ready dataset from amortisation rows */
function buildChartData(rows: AmortisationRow[]): LoanChartData {
  return {
    months: rows.map((r) => r.month),
    balance: rows.map((r) => r.balance),
    interestPaid: rows.map((r) => r.interest),
    principalPaid: rows.map((r) => r.principal),
  };
}

/** Build human-readable formula explanation */
function buildExplanation(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
  emi: number,
): LoanExplanation {
  const r = roundTo(annualRatePercent / 100 / 12, 6);
  const pow = roundTo(Math.pow(1 + r, tenureMonths), 6);
  return {
    formula: 'EMI = [P × r × (1+r)^n] / [(1+r)^n − 1]',
    substituted: `EMI = [${principal} × ${r} × (1+${r})^${tenureMonths}] / [(1+${r})^${tenureMonths} − 1] = ${emi}`,
    steps: [
      `Monthly rate r = ${annualRatePercent}% ÷ 12 = ${r}`,
      `(1 + r)^n = (1 + ${r})^${tenureMonths} = ${pow}`,
      `Numerator = ${principal} × ${r} × ${pow} = ${roundTo(principal * r * pow, 2)}`,
      `Denominator = ${pow} − 1 = ${roundTo(pow - 1, 6)}`,
      `EMI = ${roundTo(principal * r * pow, 2)} ÷ ${roundTo(pow - 1, 6)} = ${emi}`,
    ],
  };
}

/** Compute payoff date given startDate (YYYY-MM-DD) and tenure in months */
function computePayoffDate(startDate: string, tenureMonths: number): string {
  const [year, month, day] = startDate.split('-').map(Number) as [number, number, number];
  const start = new Date(year, month - 1, day);
  start.setMonth(start.getMonth() + tenureMonths);
  const y = start.getFullYear();
  const m = String(start.getMonth() + 1).padStart(2, '0');
  const d = String(start.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Always-computed warnings */
function computeWarnings(
  principal: number,
  totalInterest: number,
  tenureMonths: number,
): LoanWarning[] {
  const warnings: LoanWarning[] = [];

  if (totalInterest > principal) {
    warnings.push({
      code: 'HIGH_INTEREST_RATIO',
      message: `Total interest (${roundTo(totalInterest / principal, 2)}× principal) exceeds the loan amount.`,
      severity: 'warning',
    });
  }

  if (tenureMonths > 240) {
    warnings.push({
      code: 'LONG_TENURE',
      message: `Loan tenure exceeds 20 years. Consider reducing tenure to save on interest.`,
      severity: 'info',
    });
  }

  return warnings;
}

/** Always-computed recommendations */
function computeRecommendations(
  warnings: LoanWarning[],
  emi: number,
  annualRatePercent: number,
): LoanRecommendation[] {
  const recs: LoanRecommendation[] = [];
  const codes = new Set(warnings.map((w) => w.code));

  if (codes.has('HIGH_INTEREST_RATIO')) {
    const higherEmi = roundTo(emi * 1.1, 2);
    recs.push({
      code: 'INCREASE_EMI',
      message: `Increasing your EMI by 10% (to ₹${higherEmi}) can significantly reduce total interest.`,
    });
    if (annualRatePercent > 10) {
      recs.push({
        code: 'MAKE_PREPAYMENT',
        message: 'Periodic prepayments reduce your principal faster, cutting total interest paid.',
      });
    }
  }

  if (codes.has('LONG_TENURE')) {
    recs.push({
      code: 'REDUCE_TENURE',
      message: 'Reducing tenure by 2–5 years can save a substantial amount in interest.',
    });
  }

  return recs;
}
