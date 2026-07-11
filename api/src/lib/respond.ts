import type { Request, Response } from 'express';
import type { ApiResponse, ToolError } from '@toolbox/shared';

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

/** Parse JSON body with a Zod schema and send 400 on failure */
export function parseBody<T>(req: Request, res: Response, parse: (body: unknown) => { success: true; data: T } | { success: false; error: string }): T | null {
  const result = parse(req.body);
  if (!result.success) {
    const response: ApiResponse<never> = {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: result.error },
    };
    res.status(400).json(response);
    return null;
  }
  return result.data;
}
