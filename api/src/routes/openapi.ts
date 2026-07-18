import { Router } from 'express';
import type { Request } from 'express';
import { generateOpenApiSpec } from '../lib/openapi.js';

const router = Router();

/**
 * Resolve the base URL for the OpenAPI spec's `servers` field.
 *
 * Priority:
 *   1. API_BASE_URL env var — set this in production (Railway) to a stable
 *      value like `https://api.toolbox.jeyv.in`. Prevents first-request
 *      cache poisoning from forwarded headers.
 *   2. x-forwarded-proto / x-forwarded-host headers — used in development
 *      when behind a proxy and no env var is set.
 *   3. Fallback to http://localhost:3001.
 */
function resolveBaseUrl(req: Request): string {
  if (process.env['API_BASE_URL']) {
    return process.env['API_BASE_URL'];
  }
  const proto = req.headers['x-forwarded-proto'] ?? req.protocol ?? 'http';
  const host = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost:3001';
  return `${proto}://${host}`;
}

// Cached spec — generated once per process.
// With API_BASE_URL set in production the URL is deterministic; no need
// to regenerate on every request.
let cachedSpec: ReturnType<typeof generateOpenApiSpec> | null = null;

/**
 * GET /api/v1/openapi.json — generated OpenAPI 3.1 spec, versioned alongside its endpoints.
 *
 * The spec is generated from the tool registry and cached for the lifetime of the process.
 * No manual maintenance needed: adding a tool to ALL_TOOLS updates the spec automatically.
 */
router.get('/openapi.json', (req, res) => {
  cachedSpec ??= generateOpenApiSpec(resolveBaseUrl(req));
  res.setHeader('Content-Type', 'application/json');
  res.json(cachedSpec);
});

export { router as openApiRouter };
