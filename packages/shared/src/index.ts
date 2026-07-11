// Core types
export type {
  Result,
  AsyncResult,
  ToolError,
  ToolCategory,
  ToolVisibility,
  ToolComplexity,
  ToolInterfaces,
  FieldDef,
  ToolManifest,
  PaginationMeta,
  ApiResponse,
} from './types/index.js';

// Result helpers + error codes
export {
  ok,
  err,
  isOk,
  isErr,
  ErrorCode,
  validationError,
  invalidInputError,
} from './errors/index.js';
export type { ErrorCodeValue } from './errors/index.js';

// Validation
export {
  positiveNumberSchema,
  nonNegativeNumberSchema,
  percentageSchema,
  positiveIntegerSchema,
  currencySchema,
  safeParse,
} from './validation/index.js';

// Formatting
export {
  formatCurrency,
  formatNumber,
  roundTo,
  formatPercent,
  clamp,
} from './formatting/index.js';

// Math utilities
export {
  compoundInterestAmount,
  computeEMI,
  computeSIPFutureValue,
  percentOf,
} from './math/index.js';
