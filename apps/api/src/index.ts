import express from "express";
import { env } from "../config/env.js";
import { applyAppMiddlewares } from "../config/app.js";
import { connectDB } from "../config/db.js";
import { disconnectDB } from "../config/db.js";
import { healthRouter } from "../config/health.js";
import { logger } from "../config/logger.js";

async function bootstrap() {
  const app = express();

  // 1) Middlewares globales (logging, seguridad, CORS, JSON, cookies, etc.)
  applyAppMiddlewares(app);

  // 2) Rutas de salud (liveness/readiness)
  app.use('/', healthRouter);

  // 3) Conectar dependencias críticas ANTES de aceptar tráfico
  await connectDB();

  // 4) Levantar servidor
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 API escuchando en puerto ${env.PORT} (NODE_ENV=${env.NODE_ENV})`);
  });

  // 5) Manejo de errores “globales” (fallos no atrapados)
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, '🧨 Unhandled Promise Rejection');
  });

  process.on('uncaughtException', (err) => {
    logger.error({ err }, '🧨 Uncaught Exception');
  });

  // 6) Apagado limpio (graceful shutdown)
  const shutdown = (signal: NodeJS.Signals) => {
    logger.warn({ signal }, '🛑 Señal recibida. Iniciando apagado limpio…');

    // Evitar aceptar nuevas conexiones
    server.close(async () => {
      try {
        await disconnectDB();
        logger.info('✅ Recursos liberados. Saliendo…');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, '❌ Error cerrando recursos. Saliendo con código 1.');
        process.exit(1);
      }
    });

    // Falla segura si algo cuelga
    setTimeout(() => {
      logger.error('⏳ Timeout de shutdown alcanzado. Forzando salida.');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Arranque de la app
bootstrap().catch((err) => {
  logger.error({ err }, '❌ Error al iniciar la app');
  process.exit(1);
});