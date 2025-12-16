import type { ZodSchema } from "zod";
import type { RequestHandler } from "express";
type Source = "body" | "query" | "params";

export function validate(schema: ZodSchema<any>, source: Source = "body"): RequestHandler {
  // Al declarar que devolvemos RequestHandler, TS infiere (req,res,next) correctamente
  return (req, res, next) => {
    try {
      // Elegimos qué parte validar
      const current =
        source === "query" ? req.query :
        source === "params" ? req.params :
        req.body;

      const parsed = schema.safeParse(current);
      if (!parsed.success) {
        const issues = parsed.error.issues.map(i => ({
          path: i.path,
          message: i.message,
        }));
        return res.status(422).json({
          success: false,
          error: { code: "UNPROCESSABLE_ENTITY", message: "Validación fallida", details: issues },
        });
      }

      // Aplicamos el resultado SIN reasignar propiedades de solo-lectura

      if (source === "query") {
        Object.assign(req.query as Record<string, unknown>, parsed.data);
      } else if (source === "params") {
        Object.assign(req.params as Record<string, unknown>, parsed.data);
      } else {
        // body sí es reasignable sin problemas
        req.body = parsed.data;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}