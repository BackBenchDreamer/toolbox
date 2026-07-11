import { Router } from 'express';
import { convertUnit } from '@toolbox/utilities';
import { sendResult } from '../lib/respond.js';

const router = Router();

/** POST /api/utilities/unit-converter */
router.post('/unit-converter', (req, res) => {
  sendResult(res, convertUnit(req.body));
});

export { router as utilitiesRouter };
