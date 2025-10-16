import type { RequestHandler } from "express";

export const asyncHandler = (
  fn: (...args: any[]) => Promise<any>
): RequestHandler => {
  // Devolvemos la función middleware
  return (req, res, next) => {
    // Ejecutamos fn(req, res, next) como promesa y atrapamos errores
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
