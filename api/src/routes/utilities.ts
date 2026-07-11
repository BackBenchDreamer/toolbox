import { Router } from 'express';
import { UnitConverter } from '@toolbox/utilities';
import { asyncSendResult } from '../lib/respond.js';

/**
 * Utilities routes — thin adapters over Capability.execute().
 */
const router = Router();

/** POST /api/v1/utilities/unit-converter */
router.post('/unit-converter', (req, res) => {
  void asyncSendResult(res, UnitConverter.execute(req.body));
});

export { router as utilitiesRouter };
