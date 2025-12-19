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
import type { CorsOptions } from "cors";


export function applyAppMiddlewares(app: Express): void {
  if (env.TRUST_PROXY) app.set("trust proxy", 1);

  app.use(httpLogger);
  app.use(express.json({ limit: "1mb" }));
  app.use(helmet());

  // ✅ Lista de orígenes permitidos por env (separados por coma)
  // Ej: CORS_ORIGIN="https://incidents-system-web.vercel.app,http://localhost:5173,http://localhost:5174"
  const allowedOrigins = String(env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // ✅ fallback local (por si te olvidás de setear env en dev)
  const devFallback = ["http://localhost:5173", "http://localhost:5174"];
  const finalAllowed = Array.from(new Set([...allowedOrigins, ...devFallback]));

  const corsOptions: CorsOptions = {
    origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // requests sin Origin (Postman, curl, server-to-server) → permitir
      if (!origin) return callback(null, true);

      if (finalAllowed.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS: Origin not allowed: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["x-request-id"],
    maxAge: 86400,
  };

  app.use(cors(corsOptions));

  // ✅ Responder preflight
  app.options(/.*/, cors(corsOptions));

  app.use(cookieParser());
  app.use(compression());
}