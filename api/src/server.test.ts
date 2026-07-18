/**
 * API integration tests — every route exercised with a valid payload (200)
 * and an invalid payload (422). Tests run against the in-process Express app
 * so no ports are opened.
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './server.js';

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

describe('GET /api/v1/registry', () => {
  it('returns list of tools', async () => {
    const res = await request(app).get('/api/v1/registry');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('never exposes hidden tools', async () => {
    const res = await request(app).get('/api/v1/registry');
    expect(res.status).toBe(200);
    const tools: Array<{ visibility: string }> = res.body.data;
    const hidden = tools.filter((t) => t.visibility === 'hidden');
    expect(hidden).toHaveLength(0);
  });

  it('each returned tool has a public or beta visibility', async () => {
    const res = await request(app).get('/api/v1/registry');
    expect(res.status).toBe(200);
    const tools: Array<{ visibility: string }> = res.body.data;
    tools.forEach((t) => {
      expect(['public', 'beta']).toContain(t.visibility);
    });
  });
});

describe('GET /api/v1/registry/search', () => {
  it('returns matching tools for known term', async () => {
    const res = await request(app).get('/api/v1/registry/search?q=loan');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns empty array for unmatched term', async () => {
    const res = await request(app).get('/api/v1/registry/search?q=zzznomatch');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('GET /api/v1/registry/:id', () => {
  it('returns a tool by id', async () => {
    const res = await request(app).get('/api/v1/registry/loan-calculator');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('loan-calculator');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/v1/registry/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Finance — Loan Calculator
// ---------------------------------------------------------------------------

describe('POST /api/v1/finance/loan-calculator', () => {
  it('200 with valid input', async () => {
    const res = await request(app)
      .post('/api/v1/finance/loan-calculator')
      .send({ principal: 500000, annualRatePercent: 8.5, tenureMonths: 240 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.emi).toBe('number');
    expect(typeof res.body.data.interestPercent).toBe('number');
    expect(Array.isArray(res.body.data.warnings)).toBe(true);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
  });

  it('422 with invalid input', async () => {
    const res = await request(app)
      .post('/api/v1/finance/loan-calculator')
      .send({ principal: -1, annualRatePercent: 8.5, tenureMonths: 240 });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Finance — EMI Calculator
// ---------------------------------------------------------------------------

describe('POST /api/v1/finance/emi-calculator', () => {
  it('200 with valid input', async () => {
    const res = await request(app)
      .post('/api/v1/finance/emi-calculator')
      .send({ principal: 800000, annualRatePercent: 9, tenureMonths: 60 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.emi).toBe('number');
  });

  it('422 with invalid input', async () => {
    const res = await request(app)
      .post('/api/v1/finance/emi-calculator')
      .send({ principal: 0, annualRatePercent: 9, tenureMonths: 60 });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Finance — SIP Calculator
// ---------------------------------------------------------------------------

describe('POST /api/v1/finance/sip-calculator', () => {
  it('200 with valid input', async () => {
    const res = await request(app)
      .post('/api/v1/finance/sip-calculator')
      .send({ monthlyInvestment: 10000, annualRatePercent: 12, tenureMonths: 120 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.futureValue).toBe('number');
  });

  it('422 with invalid input', async () => {
    const res = await request(app)
      .post('/api/v1/finance/sip-calculator')
      .send({ monthlyInvestment: -100, annualRatePercent: 12, tenureMonths: 120 });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Finance — Compound Interest
// ---------------------------------------------------------------------------

describe('POST /api/v1/finance/compound-interest', () => {
  it('200 with valid input', async () => {
    const res = await request(app)
      .post('/api/v1/finance/compound-interest')
      .send({ principal: 100000, annualRatePercent: 8, years: 5, compoundingsPerYear: 12 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.futureValue).toBe('number');
  });

  it('422 with invalid input', async () => {
    const res = await request(app)
      .post('/api/v1/finance/compound-interest')
      .send({ principal: 0, annualRatePercent: 8, years: 5, compoundingsPerYear: 12 });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Finance — GST Calculator
// ---------------------------------------------------------------------------

describe('POST /api/v1/finance/gst-calculator', () => {
  it('200 with valid input', async () => {
    const res = await request(app)
      .post('/api/v1/finance/gst-calculator')
      .send({ amount: 10000, gstPercent: 18, mode: 'exclusive' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.gstAmount).toBe('number');
  });

  it('422 with invalid input', async () => {
    const res = await request(app)
      .post('/api/v1/finance/gst-calculator')
      .send({ amount: -500, gstPercent: 18, mode: 'exclusive' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Developer — Password Generator
// ---------------------------------------------------------------------------

describe('POST /api/v1/developer/password-generator', () => {
  it('200 with valid input', async () => {
    const res = await request(app)
      .post('/api/v1/developer/password-generator')
      .send({ length: 16, includeLowercase: true, includeUppercase: true, includeNumbers: true, includeSymbols: false, count: 3 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.passwords).toHaveLength(3);
  });

  it('422 with invalid input', async () => {
    const res = await request(app)
      .post('/api/v1/developer/password-generator')
      .send({ length: 2, includeLowercase: false, includeUppercase: false, includeNumbers: false, includeSymbols: false, count: 1 });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Developer — UUID Generator
// ---------------------------------------------------------------------------

describe('POST /api/v1/developer/uuid-generator', () => {
  it('200 with valid input', async () => {
    const res = await request(app)
      .post('/api/v1/developer/uuid-generator')
      .send({ count: 5, version: 'v4', uppercase: false });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.uuids).toHaveLength(5);
  });

  it('422 with invalid input', async () => {
    const res = await request(app)
      .post('/api/v1/developer/uuid-generator')
      .send({ count: 0, version: 'v4', uppercase: false });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Utilities — Unit Converter
// ---------------------------------------------------------------------------

describe('POST /api/v1/utilities/unit-converter', () => {
  it('200 with valid input', async () => {
    const res = await request(app)
      .post('/api/v1/utilities/unit-converter')
      .send({ value: 100, from: 'km', to: 'm' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.value).toBe('number');
  });

  it('422 with unknown unit', async () => {
    const res = await request(app)
      .post('/api/v1/utilities/unit-converter')
      .send({ value: 100, from: 'nope', to: 'm' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Finance — Reverse Loan
// ---------------------------------------------------------------------------

describe('POST /api/v1/finance/reverse-loan', () => {
  it('200 with valid input', async () => {
    const res = await request(app)
      .post('/api/v1/finance/reverse-loan')
      .send({ emi: 10000, annualRatePercent: 10, tenureMonths: 12 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.principal).toBe('number');
  });

  it('422 with invalid input', async () => {
    const res = await request(app)
      .post('/api/v1/finance/reverse-loan')
      .send({ emi: 0, annualRatePercent: 10, tenureMonths: 12 });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Finance — Prepayment Simulation
// ---------------------------------------------------------------------------

describe('POST /api/v1/finance/prepayment-simulation', () => {
  it('200 with valid input', async () => {
    const res = await request(app)
      .post('/api/v1/finance/prepayment-simulation')
      .send({ principal: 500000, annualRatePercent: 10, tenureMonths: 60, prepayments: [{ month: 12, amount: 50000 }] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.interestSaved).toBe('number');
    expect(res.body.data.monthsSaved).toBeGreaterThan(0);
  });

  it('422 with no prepayments', async () => {
    const res = await request(app)
      .post('/api/v1/finance/prepayment-simulation')
      .send({ principal: 500000, annualRatePercent: 10, tenureMonths: 60, prepayments: [] });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------

describe('404 handler', () => {
  it('returns 404 for unknown route', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
