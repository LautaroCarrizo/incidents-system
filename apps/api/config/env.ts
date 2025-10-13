import  {config } from 'dotenv-safe';
import path from 'path';
import { z } from 'zod';

// 1️⃣ Cargar las variables del entorno (.env y .env.example)
config({
  allowEmptyValues: false,
  example: path.resolve(__dirname, '../../.env.example'),
  path: path.resolve(__dirname, '../../.env'),
});

// 2️⃣ Validar y tipar las variables con Zod
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

  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),

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
