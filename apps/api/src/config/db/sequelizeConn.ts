import { Sequelize } from "sequelize";
import { env } from "../env.js";
import { logger } from "../logger.js";
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
