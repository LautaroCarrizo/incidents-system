import type { Request, Response } from "express";

export function notFoundHandler() {
  return (_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Ruta no encontrada" },
    });
  };
}
