import type { Response } from 'express';
import type { ApiResponse, AsyncResult, ToolError } from '@toolbox/shared';

/**
 * Wrap a package function call in a standard API response envelope.
 * Handles both Result<T> patterns and thrown errors.
 */
export function sendResult<T>(
  res: Response,
  result: { success: true; data: T } | { success: false; error: ToolError },
): void {
  if (result.success) {
    const response: ApiResponse<T> = { success: true, data: result.data };
    res.json(response);
  } else {
    const response: ApiResponse<never> = { success: false, error: result.error };
    const status = result.error.code === 'NOT_FOUND' ? 404 : 422;
    res.status(status).json(response);
  }
}

/**
 * Async variant of sendResult — resolves an AsyncResult<T> before sending.
 * Use this for Capability.execute() calls in route handlers.
 *
 * Any unexpected rejection is caught and returned as an INTERNAL_ERROR response.
 */
export async function asyncSendResult<T>(res: Response, promise: AsyncResult<T>): Promise<void> {
  try {
    const result = await promise;
    sendResult(res, result);
  } catch (e) {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: e instanceof Error ? e.message : 'Unexpected error',
      },
    };
    res.status(500).json(response);
  }
}
