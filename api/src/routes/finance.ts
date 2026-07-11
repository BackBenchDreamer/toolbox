import { Router } from 'express';
import {
  LoanCalculator,
  EMICalculator,
  SIPCalculator,
  CompoundInterestCalculator,
  GSTCalculator,
  calculateReverseLoan,
  simulatePrepayment,
} from '@toolbox/finance';
import { asyncSendResult } from '../lib/respond.js';

/**
 * Finance routes — thin adapters over Capability.execute().
 *
 * No business logic lives here. Each handler:
 *   1. Passes req.body directly to the Capability.
 *   2. Awaits the AsyncResult<T>.
 *   3. Sends the standardised API envelope via asyncSendResult.
 */
const router = Router();

/** POST /api/v1/finance/loan-calculator */
router.post('/loan-calculator', (req, res) => {
  void asyncSendResult(res, LoanCalculator.execute(req.body));
});

/** POST /api/v1/finance/emi-calculator */
router.post('/emi-calculator', (req, res) => {
  void asyncSendResult(res, EMICalculator.execute(req.body));
});

/** POST /api/v1/finance/sip-calculator */
router.post('/sip-calculator', (req, res) => {
  void asyncSendResult(res, SIPCalculator.execute(req.body));
});

/** POST /api/v1/finance/compound-interest */
router.post('/compound-interest', (req, res) => {
  void asyncSendResult(res, CompoundInterestCalculator.execute(req.body));
});

/** POST /api/v1/finance/gst-calculator */
router.post('/gst-calculator', (req, res) => {
  void asyncSendResult(res, GSTCalculator.execute(req.body));
});

/** POST /api/v1/finance/reverse-loan */
router.post('/reverse-loan', (req, res) => {
  void asyncSendResult(res, Promise.resolve(calculateReverseLoan(req.body)));
});

/** POST /api/v1/finance/prepayment-simulation */
router.post('/prepayment-simulation', (req, res) => {
  void asyncSendResult(res, Promise.resolve(simulatePrepayment(req.body)));
});

export { router as financeRouter };
