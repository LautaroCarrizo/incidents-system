import dotenv from 'dotenv';
import { z } from 'zod';


// Cargar .env usando rutas relativas a apps/api/
if (process.env.NODE_ENV !== "production") {
  dotenv.config(); // lee .env si existe en el cwd
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),

  DB_CONN_MAX: z.coerce.number().default(10),
  DB_CONN_MIN: z.coerce.number().default(0),
  DB_IDLE_MS: z.coerce.number().default(10000),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  TRUST_PROXY: z.coerce.boolean().default(false),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_DOMAIN: z.string().optional(),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_PRETTY: z.coerce.boolean().default(false),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Error de variables de entorno:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
