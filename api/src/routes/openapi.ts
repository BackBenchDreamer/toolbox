import { Router } from 'express';
import { generateOpenApiSpec } from '../lib/openapi.js';

const router = Router();
let cachedSpec: ReturnType<typeof generateOpenApiSpec> | null = null;

/**
 * GET /api/openapi.json — generated OpenAPI 3.1 spec
 * Spec is built once from the registry and cached for the lifetime of the process.
 */
router.get('/openapi.json', (req, res) => {
  if (!cachedSpec) {
    const proto = req.headers['x-forwarded-proto'] ?? req.protocol;
    const host = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost:3001';
    cachedSpec = generateOpenApiSpec(`${proto}://${host}`);
  }
  res.setHeader('Content-Type', 'application/json');
  res.json(cachedSpec);
});

export { router as openApiRouter };
