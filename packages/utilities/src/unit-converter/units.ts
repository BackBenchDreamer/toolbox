/**
 * Unit definitions and conversion factors.
 * All units are expressed relative to a common base unit per dimension.
 */

export type UnitCategory = 'length' | 'mass' | 'temperature' | 'area' | 'volume' | 'speed' | 'time' | 'data';

export interface UnitDef {
  key: string;
  label: string;
  category: UnitCategory;
  /** Conversion to base unit: base = value * toBase (except temperature which uses functions) */
  toBase?: number;
  /** For temperature only */
  toBaseFn?: (v: number) => number;
  fromBaseFn?: (v: number) => number;
}

export const UNITS: readonly UnitDef[] = [
  // Length — base: meter
  { key: 'mm', label: 'Millimetre', category: 'length', toBase: 0.001 },
  { key: 'cm', label: 'Centimetre', category: 'length', toBase: 0.01 },
  { key: 'm', label: 'Metre', category: 'length', toBase: 1 },
  { key: 'km', label: 'Kilometre', category: 'length', toBase: 1000 },
  { key: 'in', label: 'Inch', category: 'length', toBase: 0.0254 },
  { key: 'ft', label: 'Foot', category: 'length', toBase: 0.3048 },
  { key: 'yd', label: 'Yard', category: 'length', toBase: 0.9144 },
  { key: 'mi', label: 'Mile', category: 'length', toBase: 1609.344 },

  // Mass — base: kilogram
  { key: 'mg', label: 'Milligram', category: 'mass', toBase: 0.000001 },
  { key: 'g', label: 'Gram', category: 'mass', toBase: 0.001 },
  { key: 'kg', label: 'Kilogram', category: 'mass', toBase: 1 },
  { key: 't', label: 'Metric Tonne', category: 'mass', toBase: 1000 },
  { key: 'oz', label: 'Ounce', category: 'mass', toBase: 0.028349523 },
  { key: 'lb', label: 'Pound', category: 'mass', toBase: 0.453592 },

  // Temperature — special conversion
  {
    key: 'C', label: 'Celsius', category: 'temperature',
    toBaseFn: (v) => v,          // base is Celsius
    fromBaseFn: (v) => v,
  },
  {
    key: 'F', label: 'Fahrenheit', category: 'temperature',
    toBaseFn: (v) => (v - 32) * 5 / 9,
    fromBaseFn: (v) => v * 9 / 5 + 32,
  },
  {
    key: 'K', label: 'Kelvin', category: 'temperature',
    toBaseFn: (v) => v - 273.15,
    fromBaseFn: (v) => v + 273.15,
  },

  // Area — base: m²
  { key: 'm2', label: 'Square Metre', category: 'area', toBase: 1 },
  { key: 'km2', label: 'Square Kilometre', category: 'area', toBase: 1_000_000 },
  { key: 'cm2', label: 'Square Centimetre', category: 'area', toBase: 0.0001 },
  { key: 'ft2', label: 'Square Foot', category: 'area', toBase: 0.092903 },
  { key: 'in2', label: 'Square Inch', category: 'area', toBase: 0.00064516 },
  { key: 'acre', label: 'Acre', category: 'area', toBase: 4046.8564 },
  { key: 'ha', label: 'Hectare', category: 'area', toBase: 10000 },

  // Volume — base: litre
  { key: 'ml', label: 'Millilitre', category: 'volume', toBase: 0.001 },
  { key: 'l', label: 'Litre', category: 'volume', toBase: 1 },
  { key: 'm3', label: 'Cubic Metre', category: 'volume', toBase: 1000 },
  { key: 'fl_oz', label: 'Fluid Ounce (US)', category: 'volume', toBase: 0.029574 },
  { key: 'gal', label: 'Gallon (US)', category: 'volume', toBase: 3.785411784 },

  // Speed — base: m/s
  { key: 'm_s', label: 'Metre/second', category: 'speed', toBase: 1 },
  { key: 'km_h', label: 'Kilometre/hour', category: 'speed', toBase: 0.277778 },
  { key: 'mph', label: 'Mile/hour', category: 'speed', toBase: 0.44704 },
  { key: 'knot', label: 'Knot', category: 'speed', toBase: 0.514444 },

  // Time — base: second
  { key: 's', label: 'Second', category: 'time', toBase: 1 },
  { key: 'min', label: 'Minute', category: 'time', toBase: 60 },
  { key: 'h', label: 'Hour', category: 'time', toBase: 3600 },
  { key: 'd', label: 'Day', category: 'time', toBase: 86400 },
  { key: 'wk', label: 'Week', category: 'time', toBase: 604800 },
  { key: 'mo', label: 'Month (30d)', category: 'time', toBase: 2592000 },
  { key: 'yr', label: 'Year (365d)', category: 'time', toBase: 31536000 },

  // Digital data — base: byte
  { key: 'B', label: 'Byte', category: 'data', toBase: 1 },
  { key: 'KB', label: 'Kilobyte', category: 'data', toBase: 1024 },
  { key: 'MB', label: 'Megabyte', category: 'data', toBase: 1_048_576 },
  { key: 'GB', label: 'Gigabyte', category: 'data', toBase: 1_073_741_824 },
  { key: 'TB', label: 'Terabyte', category: 'data', toBase: 1_099_511_627_776 },
] as const;

export const UNIT_MAP = new Map<string, UnitDef>(UNITS.map((u) => [u.key, u]));
