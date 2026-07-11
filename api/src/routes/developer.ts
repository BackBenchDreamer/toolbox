import { Router } from 'express';
import { generatePassword } from '@toolbox/developer';
import { generateUUID } from '@toolbox/developer';
import { sendResult } from '../lib/respond.js';

const router = Router();

/** POST /api/developer/password-generator */
router.post('/password-generator', (req, res) => {
  sendResult(res, generatePassword(req.body));
});

/** POST /api/developer/uuid-generator */
router.post('/uuid-generator', (req, res) => {
  sendResult(res, generateUUID(req.body));
});

export { router as developerRouter };
