import express from 'express';
import cors from 'cors';
import { financeRouter } from './routes/finance.js';
import { utilitiesRouter } from './routes/utilities.js';
import { developerRouter } from './routes/developer.js';
import { registryRouter } from './routes/registry.js';
import { openApiRouter } from './routes/openapi.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1', uptime: process.uptime() });
});

// Versioned API routes — all traffic under /api/v1/
app.use('/api/v1/finance', financeRouter);
app.use('/api/v1/utilities', utilitiesRouter);
app.use('/api/v1/developer', developerRouter);
app.use('/api/v1/registry', registryRouter);

// OpenAPI spec — generated from the tool registry
app.use('/api', openApiRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});

const PORT = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3001;

if (process.env['NODE_ENV'] !== 'test') {
  app.listen(PORT, '127.0.0.1', () => {
    console.warn(`Toolbox API v1 running on http://127.0.0.1:${PORT}`);
    console.warn(`OpenAPI spec:      http://127.0.0.1:${PORT}/api/openapi.json`);
  });
}

export { app };
