import type { ToolError, Result } from '../types/index.js';

/** Create a successful result */
export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

/** Create a failed result */
export function err<E extends ToolError = ToolError>(error: E): Result<never, E> {
  return { success: false, error };
}

/** Type-guard for successful result */
export function isOk<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success === true;
}

/** Type-guard for failed result */
export function isErr<T>(result: Result<T>): result is { success: false; error: ToolError } {
  return result.success === false;
}

/** Standard error codes */
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNSUPPORTED_UNIT: 'UNSUPPORTED_UNIT',
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Create a validation error result */
export function validationError(message: string, field?: string): Result<never> {
  return err({
    code: ErrorCode.VALIDATION_ERROR,
    message,
    ...(field !== undefined ? { field } : {}),
  });
}

/** Create an invalid-input error result */
export function invalidInputError(message: string, field?: string): Result<never> {
  return err({
    code: ErrorCode.INVALID_INPUT,
    message,
    ...(field !== undefined ? { field } : {}),
  });
}
