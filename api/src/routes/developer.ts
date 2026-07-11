import { Router } from 'express';
import { PasswordGenerator, UUIDGenerator } from '@toolbox/developer';
import { asyncSendResult } from '../lib/respond.js';

/**
 * Developer routes — thin adapters over Capability.execute().
 */
const router = Router();

/** POST /api/v1/developer/password-generator */
router.post('/password-generator', (req, res) => {
  void asyncSendResult(res, PasswordGenerator.execute(req.body));
});

/** POST /api/v1/developer/uuid-generator */
router.post('/uuid-generator', (req, res) => {
  void asyncSendResult(res, UUIDGenerator.execute(req.body));
});

export { router as developerRouter };
