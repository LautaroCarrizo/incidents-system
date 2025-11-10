// src/controllers/users/authController.ts
import type { Request, Response } from "express";
import * as authService from "../../services/auth/authService.js";
import type { LoginInput, RegisterInput } from "../../schemas/auth/authSchema.js";

export async function register(
  req: Request<{}, any, RegisterInput>,
  res: Response
) {
  const data = await authService.register(req.body);
  return res.status(201).json({ success: true, data });
}

export async function login(
  req: Request<{}, any, LoginInput>,
  res: Response
) {
  const data = await authService.login(req.body);
  return res.json({ success: true, data });
}
