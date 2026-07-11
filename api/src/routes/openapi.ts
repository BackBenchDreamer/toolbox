import { Router } from 'express';
import { generateOpenApiSpec } from '../lib/openapi.js';

const router = Router();
let cachedSpec: ReturnType<typeof generateOpenApiSpec> | null = null;

function buildSpec(req: import('express').Request) {
  const proto = req.headers['x-forwarded-proto'] ?? req.protocol;
  const host = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost:3001';
  return generateOpenApiSpec(`${proto}://${host}`);
}

/**
 * GET /api/v1/openapi.json — generated OpenAPI 3.1 spec, versioned alongside its endpoints.
 *
 * The spec is generated from the tool registry and cached for the lifetime of the process.
 * No manual maintenance needed: adding a tool to ALL_TOOLS updates the spec automatically.
 */
router.get('/openapi.json', (req, res) => {
  cachedSpec ??= buildSpec(req);
  res.setHeader('Content-Type', 'application/json');
  res.json(cachedSpec);
});

export { router as openApiRouter };
