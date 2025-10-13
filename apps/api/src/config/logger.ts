import pino, { type LoggerOptions, type Level } from 'pino'
import { env } from './env.js'
import { randomUUID } from 'crypto'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const pinoHttp: (opts?: any) => any = require('pino-http')

const base: LoggerOptions = { level: env.LOG_LEVEL as Level }
const options: LoggerOptions =
  env.NODE_ENV === 'development' && env.LOG_PRETTY
    ? { ...base, transport: { target: 'pino-pretty', options: { colorize: true, translateTime: true } as any } }
    : base

export const logger = pino(options)
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req: any, res: any) => {
    const existing = req.headers['x-request-id']
    const id = typeof existing === 'string' ? existing : randomUUID()
    res.setHeader('x-request-id', id)
    return id
  },
  customLogLevel: (_req: any, res: any, err: any) => (err ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
  customSuccessMessage: (req: any, res: any) => `${req.method} ${req.url} → ${res.statusCode}`,
  customErrorMessage: (req: any, _res: any, err: any) => `❌ ${req.method} ${req.url} failed: ${err.message}`
})
