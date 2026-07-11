import { z } from 'zod';

/**
 * Common Zod schemas reused across multiple tools.
 */

export const positiveNumberSchema = z
  .number({ invalid_type_error: 'Must be a number' })
  .positive('Must be greater than 0');

export const nonNegativeNumberSchema = z
  .number({ invalid_type_error: 'Must be a number' })
  .nonnegative('Must be 0 or greater');

export const percentageSchema = z
  .number({ invalid_type_error: 'Must be a number' })
  .min(0, 'Must be at least 0%')
  .max(100, 'Must be at most 100%');

export const positiveIntegerSchema = z
  .number({ invalid_type_error: 'Must be a number' })
  .int('Must be a whole number')
  .positive('Must be greater than 0');

export const currencySchema = positiveNumberSchema.describe('Monetary amount in base currency units');

/**
 * Parse a Zod schema and return a typed result rather than throwing.
 */
export function safeParse<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const message = result.error.issues
    .map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message))
    .join('; ');
  return { success: false, error: message };
}
