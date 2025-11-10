// src/routes/users/authRoute.ts
import { Router } from "express";
import { validate } from "../../middlewares/validate/validate.js";
import { asyncHandler } from "../../middlewares/handlers/asyncHandler.js";
import { authGuard } from "../../middlewares/auth/authGuard.js";
import { LoginSchema, RegisterSchema } from "../../schemas/auth/authSchema.js";
import * as ctrl from "../../controllers/auth/authController.js";

export const authRouter : Router = Router();


authRouter.post(
  "/register",
  validate(RegisterSchema, "body"),
  asyncHandler(ctrl.register)
);


authRouter.post(
  "/login",
  validate(LoginSchema, "body"),
  asyncHandler(ctrl.login)
);


authRouter.get("/me", authGuard(), (req, res) => {
  return res.json({ success: true, data: { user: req.user } });
});
