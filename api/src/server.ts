import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { financeRouter } from './routes/finance.js';
import { utilitiesRouter } from './routes/utilities.js';
import { developerRouter } from './routes/developer.js';
import { registryRouter } from './routes/registry.js';
import { openApiRouter } from './routes/openapi.js';

const app = express();

app.use(cors());
app.use(express.json());

// Rate limiting — 100 requests per minute per IP on compute endpoints.
// Excludes /health and the OpenAPI spec (read-only, cacheable).
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } },
});
app.use('/api/v1/finance', apiLimiter);
app.use('/api/v1/utilities', apiLimiter);
app.use('/api/v1/developer', apiLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1', uptime: process.uptime() });
});

// Versioned API routes — all traffic under /api/v1/
app.use('/api/v1/finance', financeRouter);
app.use('/api/v1/utilities', utilitiesRouter);
app.use('/api/v1/developer', developerRouter);
app.use('/api/v1/registry', registryRouter);

// OpenAPI spec — versioned alongside the endpoints it documents
app.use('/api/v1', openApiRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

const PORT = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3001;
// Bind to all interfaces in production (Railway/Fly/Render require 0.0.0.0).
// Keep localhost-only in development to avoid accidental LAN exposure.
const HOST = process.env['NODE_ENV'] === 'production' ? '0.0.0.0' : '127.0.0.1';

if (process.env['NODE_ENV'] !== 'test') {
  app.listen(PORT, HOST, () => {
    console.warn(`Toolbox API v1 running on http://${HOST}:${PORT}`);
    console.warn(`OpenAPI spec:      http://${HOST}:${PORT}/api/v1/openapi.json`);
  });
}

export { app };
