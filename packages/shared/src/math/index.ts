/**
 * Math utilities for financial/engineering calculations.
 */

/** Compute compound interest: A = P(1 + r/n)^(nt) */
export function compoundInterestAmount(
  principal: number,
  annualRatePercent: number,
  years: number,
  compoundingsPerYear: number,
): number {
  const r = annualRatePercent / 100;
  const n = compoundingsPerYear;
  return principal * Math.pow(1 + r / n, n * years);
}

/** Compute monthly EMI: EMI = [P * r * (1+r)^n] / [(1+r)^n - 1] */
export function computeEMI(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
): number {
  if (annualRatePercent === 0) return principal / tenureMonths;
  const r = annualRatePercent / 100 / 12;
  const n = tenureMonths;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/** Compute future value of regular investment (SIP) */
export function computeSIPFutureValue(
  monthlyInvestment: number,
  annualRatePercent: number,
  tenureMonths: number,
): number {
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return monthlyInvestment * tenureMonths;
  return monthlyInvestment * ((Math.pow(1 + r, tenureMonths) - 1) / r) * (1 + r);
}

/** Percentage of a value */
export function percentOf(percent: number, value: number): number {
  return (percent / 100) * value;
}
