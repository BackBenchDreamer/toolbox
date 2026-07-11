/**
 * Pure export helpers for Loan Calculator output.
 *
 * These are standalone functions — they operate on data already produced by
 * calculateLoan(). They have no I/O and no side effects. They are NOT methods
 * on Capability.execute().
 */
import type { AmortisationRow, LoanOutput } from './schema.js';

export interface CSVOptions {
  /** Include a header row (default: true) */
  includeHeader?: boolean;
}

/**
 * Convert an amortisation schedule to a CSV string.
 *
 * Columns: Month, EMI, Principal, Interest, Balance, CumPrincipal, CumInterest
 */
export function scheduleToCSV(rows: AmortisationRow[], options?: CSVOptions): string {
  const includeHeader = options?.includeHeader ?? true;
  const lines: string[] = [];

  if (includeHeader) {
    lines.push('Month,EMI,Principal,Interest,Balance,CumPrincipal,CumInterest');
  }

  for (const row of rows) {
    lines.push(
      `${row.month},${row.emi},${row.principal},${row.interest},${row.balance},${row.cumPrincipal},${row.cumInterest}`,
    );
  }

  return lines.join('\n');
}

/**
 * Serialise full LoanOutput to a formatted JSON string.
 * Suitable for "Copy as JSON" or file download.
 */
export function outputToJSON(output: LoanOutput): string {
  return JSON.stringify(output, null, 2);
}
