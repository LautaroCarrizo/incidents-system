import { Sequelize } from "sequelize";
import { env } from "./env.js";
import { logger } from "./logger.js";
import { applyRelations } from "../models/relations/relations.js";
export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: "mysql",
  pool: {
    max: env.DB_CONN_MAX,
    min: env.DB_CONN_MIN,
    idle: env.DB_IDLE_MS,
  },
  logging:
    env.NODE_ENV === "development"
      ? (msg) => logger.debug({ sql: msg })
      : false,
});

export async function connectDB(): Promise<void> {
  try {
    applyRelations();
    await sequelize.authenticate();
    logger.info("✅ Conectado a MySQL");
    if (env.NODE_ENV !== "production") {
      await sequelize.sync({ force: true });
      logger.info("🛠️  Sequelize sync (alter) completado");
    }
  } catch (err) {
    logger.error({ err }, "❌ Error conectando a MySQL");
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await sequelize.close();
  logger.info("🛑 Conexión a MySQL cerrada");
}
