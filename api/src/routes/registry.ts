import { Router } from 'express';
import { ALL_TOOLS, getToolById, searchTools, getToolsByCategory } from '@toolbox/registry';
import type { Request, Response } from 'express';

const router = Router();

/** GET /api/registry — list all public tools */
router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: ALL_TOOLS });
});

/** GET /api/registry/search?q=... — search tools */
router.get('/search', (req: Request, res: Response) => {
  const q = typeof req.query['q'] === 'string' ? req.query['q'] : '';
  res.json({ success: true, data: searchTools(q) });
});

/** GET /api/registry/:id — single tool manifest */
router.get('/:id', (req: Request, res: Response) => {
  const rawId = req.params['id'];
  const tool = getToolById(typeof rawId === 'string' ? rawId : '');
  if (!tool) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tool not found' } });
    return;
  }
  res.json({ success: true, data: tool });
});

/** GET /api/registry/category/:cat */
router.get('/category/:cat', (req: Request, res: Response) => {
  const tools = getToolsByCategory(req.params['cat'] as never);
  res.json({ success: true, data: tools });
});

export { router as registryRouter };
