import type { Request, Response, NextFunction } from "express";

export function requireAdmin() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Requiere rol admin" },
      });
    }
    next();
  };
}
