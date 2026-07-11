import { Router } from 'express';
import { calculateLoan } from '@toolbox/finance';
import { calculateEMI } from '@toolbox/finance';
import { calculateSIP } from '@toolbox/finance';
import { calculateCompoundInterest } from '@toolbox/finance';
import { calculateGST } from '@toolbox/finance';
import { sendResult } from '../lib/respond.js';

const router = Router();

/** POST /api/finance/loan-calculator */
router.post('/loan-calculator', (req, res) => {
  sendResult(res, calculateLoan(req.body));
});

/** POST /api/finance/emi-calculator */
router.post('/emi-calculator', (req, res) => {
  sendResult(res, calculateEMI(req.body));
});

/** POST /api/finance/sip-calculator */
router.post('/sip-calculator', (req, res) => {
  sendResult(res, calculateSIP(req.body));
});

/** POST /api/finance/compound-interest */
router.post('/compound-interest', (req, res) => {
  sendResult(res, calculateCompoundInterest(req.body));
});

/** POST /api/finance/gst-calculator */
router.post('/gst-calculator', (req, res) => {
  sendResult(res, calculateGST(req.body));
});

export { router as financeRouter };
