import { Router } from "express";
import { validate } from "../../middlewares/validate/validate.js";
import { authGuard } from "../../middlewares/auth/authGuard.js";
import { asyncHandler } from "../../middlewares/handlers/asyncHandler.js";
import {
  UserCreateSchema,
  UserQuerySchema,
  UserUpdateSchema,
} from "../../schemas/user/userSchema.js";
import * as ctrl from "../../controllers/users/userController.js";

export const userRouter: Router = Router();

//userRouter.use(authGuard());

userRouter.get(
  "/",
  validate(UserQuerySchema, "query"),
  asyncHandler(ctrl.list)
);

userRouter.post(
  "/",
  validate(UserCreateSchema, "body"),
  asyncHandler(ctrl.create)
);

userRouter.get("/:id", asyncHandler(ctrl.getById));

userRouter.get("/email/:email", asyncHandler(ctrl.getByEmail));

userRouter.patch(
  "/:id",
  validate(UserUpdateSchema, "body"),
  asyncHandler(ctrl.update)
);

userRouter.delete("/:id", asyncHandler(ctrl.remove));
