import { ok, err, ErrorCode, roundTo } from '@toolbox/shared';
import type { Result, Capability } from '@toolbox/shared';
import { UnitConverterInputSchema } from './schema.js';
import type { UnitConverterInput, UnitConverterOutput } from './schema.js';
import { UNIT_MAP } from './units.js';
import manifest from './manifest.js';

export type { UnitConverterInput, UnitConverterOutput } from './schema.js';
export { UNITS, UNIT_MAP } from './units.js';
export type { UnitCategory, UnitDef } from './units.js';

/**
 * Convert a value between compatible units.
 *
 * Conversion path: value → base unit → target unit
 * Temperature uses dedicated linear transformation functions.
 *
 * Time complexity: O(1)
 */
export function convertUnit(input: UnitConverterInput): Result<UnitConverterOutput> {
  const parsed = UnitConverterInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({ code: ErrorCode.VALIDATION_ERROR, message: parsed.error.issues.map((i) => i.message).join('; ') });
  }

  const { value, from, to } = parsed.data;
  const fromDef = UNIT_MAP.get(from);
  const toDef = UNIT_MAP.get(to);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (!fromDef || !toDef) {
    return err({ code: ErrorCode.UNSUPPORTED_UNIT, message: `Unknown unit: ${!fromDef ? from : to}` });
  }

  if (fromDef.category !== toDef.category) {
    return err({
      code: ErrorCode.INVALID_INPUT,
      message: `Cannot convert between ${fromDef.category} and ${toDef.category}`,
    });
  }

  let result: number;

  if (fromDef.category === 'temperature') {
    const toBase = fromDef.toBaseFn!(value);
    result = toDef.fromBaseFn!(toBase);
  } else {
    const base = value * fromDef.toBase!;
    result = base / toDef.toBase!;
  }

  const rounded = roundTo(result, 8);
  const formula = `${value} ${fromDef.label} = ${rounded} ${toDef.label}`;

  return ok({ value: rounded, from, to, fromLabel: fromDef.label, toLabel: toDef.label, formula });
}

/** UnitConverter — Capability implementation wrapping convertUnit(). */
export const UnitConverter: Capability<UnitConverterInput, UnitConverterOutput> = {
  manifest,
  execute: (input) => Promise.resolve(convertUnit(input)),
};
