import type { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

type Source = "body" | "query" | "params";

export function validate(schema: ZodSchema, source: Source = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const data =
      source === "body"
        ? req.body
        : source === "query"
          ? req.query
          : req.params;

    const result = schema.safeParse(data);
    if (!result.success) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Payload inválido",
          details: result.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
      });
    }

    if (source === "body") req.body = result.data;
    if (source === "query") req.query = result.data as any;
    if (source === "params") req.params = result.data as any;
    next();
  };
}
