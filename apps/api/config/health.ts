import { Router } from 'express';
import { sequelize } from './db.js';

export const healthRouter: Router = Router();

healthRouter.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

healthRouter.get('/readyz', async (_req, res) => {
  try {
    await sequelize.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'degraded', details: { db: 'down' } });
  }
});
