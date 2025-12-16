import type { Express } from 'express';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './env.js';
import { httpLogger } from './logger.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const compression = require('compression');
const cors = require('cors');



export function applyAppMiddlewares(app: Express): void {
  if (env.TRUST_PROXY) app.set('trust proxy', 1);

  app.use(httpLogger);
  app.use(express.json({ limit: '1mb' }));
  app.use(helmet());

  app.use(
    cors({
      origin: [env.CORS_ORIGIN, "http://localhost:5174"],   // ej: http://localhost:5173
      credentials: true,         // necesario si usás cookies httpOnly
    })
  );

  app.use(cookieParser());
  app.use(compression());
}
