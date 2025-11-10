import { env } from "../env.js";
import { logger } from "../logger.js";
import { sequelize } from "./sequelizeConn.js";
export async function connectDB(): Promise<void> {
  try {
    await import("../../models/relations/applyRelations.js");
    await sequelize.authenticate();
    logger.info("✅ Conectado a MySQL");
    if (env.NODE_ENV !== "production") {
      await sequelize.sync({force: true});
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
