import { Router } from "express";
import { validate } from "../../middlewares/validate/validate.js";
import { authGuard } from "../../middlewares/auth/authGuard.js";
import { asyncHandler } from "../../middlewares/handlers/asyncHandler.js";
import {
  AgentCreateSchema,
  AgentQuerySchema,
  AgentUpdateSchema,
} from "../../schemas/agents/agentsSchema.js";
import * as ctrl from "../../controllers/agent/agentController.js";

export const agentRouter: Router = Router();

agentRouter.use(authGuard());

agentRouter.get(
  "/",
  validate(AgentQuerySchema, "query"),
  asyncHandler(ctrl.list)
);

agentRouter.post(
  "/",
  validate(AgentCreateSchema, "body"),
  asyncHandler(ctrl.create)
);

agentRouter.get("/:id", asyncHandler(ctrl.getById));

agentRouter.patch(
  "/:id",
  validate(AgentUpdateSchema, "body"),
  asyncHandler(ctrl.update)
);

agentRouter.delete("/:id", asyncHandler(ctrl.remove));
