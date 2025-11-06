import { Router } from "express";
import { validate } from "../../middlewares/validate/validate.js";
import { authGuard } from "../../middlewares/auth/authGuard.js";
import { asyncHandler } from "../../middlewares/handlers/asyncHandler.js";

import {
  AssignmentCreateSchema,
  AssignmentQuerySchema,
  AssignmentUpdateSchema,
} from "../../schemas/assignments/assignmentsSchema.js";

import * as ctrl from "../../controllers/assignment/assignmentController.js";

export const assignmentRouter: Router = Router();

//assignmentRouter.use(authGuard());

assignmentRouter.get(
  "/",
  validate(AssignmentQuerySchema, "query"),
  asyncHandler(ctrl.list)
);

assignmentRouter.post(
  "/",
  validate(AssignmentCreateSchema, "body"),
  asyncHandler(ctrl.create)
);

assignmentRouter.get("/:id", asyncHandler(ctrl.getById));
assignmentRouter.get("/incident/:id", asyncHandler(ctrl.getByIncidentId));

assignmentRouter.patch(
  "/:id",
  validate(AssignmentUpdateSchema, "body"),
  asyncHandler(ctrl.update)
);

assignmentRouter.delete("/:id", asyncHandler(ctrl.remove));
