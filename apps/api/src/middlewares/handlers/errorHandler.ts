import type { Request, Response, NextFunction } from "express";
import { logger } from "../../config/logger.js";
export function errorHandler() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);
  
    const status =
      err.statusCode ||
      (err.name === "SequelizeUniqueConstraintError" ? 409 :
       err.name === "SequelizeForeignKeyConstraintError" ? 409 :
       500);

    const code =
      err.code ||
      (status === 409 ? "CONFLICT" :
       status === 400 ? "BAD_REQUEST" :
       status === 401 ? "UNAUTHORIZED" :
       status === 403 ? "FORBIDDEN" :
       status === 404 ? "NOT_FOUND" :
       "INTERNAL_ERROR");

    return res.status(status).json({
      success: false,
      error: {
        code,
        message: err.message || "Error interno",
        details: err.details,
      },
    });
  };
}
