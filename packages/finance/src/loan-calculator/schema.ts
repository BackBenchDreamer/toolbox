import { z } from 'zod';
import { positiveNumberSchema, positiveIntegerSchema } from '@toolbox/shared';

// ─── Input ────────────────────────────────────────────────────────────────────

export const LoanInputSchema = z.object({
  principal: positiveNumberSchema.describe('Loan principal amount'),
  annualRatePercent: z
    .number()
    .min(0, 'Rate must be 0 or greater')
    .max(100, 'Rate must be at most 100')
    .describe('Annual interest rate as percentage'),
  tenureMonths: positiveIntegerSchema.describe('Loan tenure in months'),
  includeSchedule: z.boolean().optional().default(false).describe('Include full amortisation schedule'),
  includeYearlySummary: z.boolean().optional().default(false).describe('Include year-by-year summary'),
  includeChartData: z.boolean().optional().default(false).describe('Include chart-ready dataset'),
  includeExplanation: z.boolean().optional().default(false).describe('Include formula explanation'),
  /** ISO date string YYYY-MM-DD. When provided, payoffDate is computed and included in output. */
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD').optional(),
});

// ─── AmortisationRow ─────────────────────────────────────────────────────────

export const AmortisationRowSchema = z.object({
  month: z.number().int().positive(),
  emi: z.number(),
  principal: z.number(),
  interest: z.number(),
  balance: z.number(),
  cumPrincipal: z.number().describe('Cumulative principal paid to this month'),
  cumInterest: z.number().describe('Cumulative interest paid to this month'),
});

// ─── Yearly summary ──────────────────────────────────────────────────────────

export const YearlySummaryRowSchema = z.object({
  year: z.number().int().positive(),
  principalPaid: z.number(),
  interestPaid: z.number(),
  totalPaid: z.number(),
  closingBalance: z.number(),
});

// ─── Chart data ───────────────────────────────────────────────────────────────

export const LoanChartDataSchema = z.object({
  months: z.array(z.number()),
  balance: z.array(z.number()),
  interestPaid: z.array(z.number()),
  principalPaid: z.array(z.number()),
});

// ─── Explanation ─────────────────────────────────────────────────────────────

export const LoanExplanationSchema = z.object({
  formula: z.string(),
  substituted: z.string(),
  steps: z.array(z.string()),
});

// ─── Warnings / Recommendations ──────────────────────────────────────────────

export const LoanWarningSchema = z.object({
  code: z.enum(['HIGH_INTEREST_RATIO', 'LONG_TENURE']),
  message: z.string(),
  severity: z.enum(['info', 'warning']),
});

export const LoanRecommendationSchema = z.object({
  code: z.enum(['INCREASE_EMI', 'REDUCE_TENURE', 'MAKE_PREPAYMENT']),
  message: z.string(),
  potentialSavings: z.number().optional(),
});

// ─── Output ───────────────────────────────────────────────────────────────────

export const LoanOutputSchema = z.object({
  // Always present
  emi: z.number().describe('Monthly EMI'),
  totalPayment: z.number().describe('Total amount paid over tenure'),
  totalInterest: z.number().describe('Total interest paid'),
  interestPercent: z.number().describe('Total interest as % of total payment'),
  warnings: z.array(LoanWarningSchema).describe('Structured warnings, may be empty'),
  recommendations: z.array(LoanRecommendationSchema).describe('Actionable recommendations, may be empty'),
  // Conditional
  schedule: z.array(AmortisationRowSchema).optional(),
  yearlySummary: z.array(YearlySummaryRowSchema).optional(),
  chartData: LoanChartDataSchema.optional(),
  explanation: LoanExplanationSchema.optional(),
  /** YYYY-MM-DD — only present when startDate was in the input */
  payoffDate: z.string().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoanInput = z.input<typeof LoanInputSchema>;
export type LoanOutput = z.infer<typeof LoanOutputSchema>;
export type AmortisationRow = z.infer<typeof AmortisationRowSchema>;
export type YearlySummaryRow = z.infer<typeof YearlySummaryRowSchema>;
export type LoanChartData = z.infer<typeof LoanChartDataSchema>;
export type LoanExplanation = z.infer<typeof LoanExplanationSchema>;
export type LoanWarning = z.infer<typeof LoanWarningSchema>;
export type LoanRecommendation = z.infer<typeof LoanRecommendationSchema>;
