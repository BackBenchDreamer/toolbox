import { z } from 'zod';
import { UNIT_MAP } from './units.js';

const unitKey = z.string().refine((k) => UNIT_MAP.has(k), { message: 'Unknown unit key' });

export const UnitConverterInputSchema = z.object({
  value: z.number({ invalid_type_error: 'Value must be a number' }),
  from: unitKey.describe('Source unit key (e.g. "km", "kg", "C")'),
  to: unitKey.describe('Target unit key'),
});

export type UnitConverterInput = z.infer<typeof UnitConverterInputSchema>;

export interface UnitConverterOutput {
  value: number;
  from: string;
  to: string;
  fromLabel: string;
  toLabel: string;
  formula: string;
}
