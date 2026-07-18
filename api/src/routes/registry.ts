import { Router } from 'express';
import { getPublicTools, getToolById, searchTools, getToolsByCategory } from '@toolbox/registry';
import type { Request, Response } from 'express';

const router = Router();

/** GET /api/v1/registry — list all public and beta tools */
router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: getPublicTools() });
});

/** GET /api/v1/registry/search?q=... — search tools */
router.get('/search', (req: Request, res: Response) => {
  const q = typeof req.query['q'] === 'string' ? req.query['q'] : '';
  res.json({ success: true, data: searchTools(q) });
});

/**
 * GET /api/v1/registry/category/:cat — tools by category.
 *
 * IMPORTANT: this route must be registered BEFORE /:id to prevent Express
 * matching the literal string "category" as a tool id.
 */
router.get('/category/:cat', (req: Request, res: Response) => {
  const tools = getToolsByCategory(req.params['cat'] as never);
  res.json({ success: true, data: tools });
});

/** GET /api/v1/registry/:id — single tool manifest */
router.get('/:id', (req: Request, res: Response) => {
  const rawId = req.params['id'];
  const tool = getToolById(typeof rawId === 'string' ? rawId : '');
  if (!tool) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tool not found' } });
    return;
  }
  res.json({ success: true, data: tool });
});

export { router as registryRouter };
