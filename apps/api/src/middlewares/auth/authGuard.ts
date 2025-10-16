
import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev-secret";

export function authGuard() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = req.headers.authorization;
      const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
      const token = bearer || (req as any).cookies?.accessToken || null;

      if (!token) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Falta token" },
        });
      }

      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET); // string | JwtPayload
      if (typeof decoded === "string") {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Token inválido" },
        });
      }

      // decoded es JwtPayload
      const sub = decoded.sub; // string | undefined
      if (!sub) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Token sin subject" },
        });
      }

      const userId = Number(sub);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Subject inválido" },
        });
      }

      req.user = {
        id: userId,
        isAdmin: !!(decoded as JwtPayload & { isAdmin?: boolean }).isAdmin,
      };

      next();
    } catch {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Token inválido o vencido" },
      });
    }
  };
}
