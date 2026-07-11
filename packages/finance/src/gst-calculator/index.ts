import { ok, err, ErrorCode, roundTo } from '@toolbox/shared';
import type { Result } from '@toolbox/shared';
import { GSTInputSchema } from './schema.js';
import type { GSTInput, GSTOutput } from './schema.js';

/**
 * GST Calculator — handles both exclusive and inclusive modes.
 *
 * Exclusive: GST added on top → total = amount + (amount × rate/100)
 * Inclusive: base extracted → base = total / (1 + rate/100), gst = total − base
 */
export function calculateGST(input: GSTInput): Result<GSTOutput> {
  const parsed = GSTInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: ErrorCode.VALIDATION_ERROR, message: parsed.error.issues.map((i) => i.message).join('; ') });
  }

  const { amount, gstPercent, mode } = parsed.data;
  const rate = gstPercent / 100;

  let baseAmount: number;
  let gstAmount: number;
  let totalAmount: number;

  if (mode === 'exclusive') {
    baseAmount = amount;
    gstAmount = roundTo(amount * rate, 2);
    totalAmount = roundTo(amount + gstAmount, 2);
  } else {
    totalAmount = amount;
    baseAmount = roundTo(amount / (1 + rate), 2);
    gstAmount = roundTo(totalAmount - baseAmount, 2);
  }

  const cgst = roundTo(gstAmount / 2, 2);
  const sgst = roundTo(gstAmount / 2, 2);
  const effectiveRate = roundTo((gstAmount / baseAmount) * 100, 4);

  return ok({ baseAmount, gstAmount, totalAmount, cgst, sgst, effectiveRate });
}
