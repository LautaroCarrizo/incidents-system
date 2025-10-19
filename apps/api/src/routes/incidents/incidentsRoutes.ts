import { Router } from "express";
import { validate } from "../../middlewares/validate/validate.js";
import { authGuard } from "../../middlewares/auth/authGuard.js";
import { asyncHandler } from "../../middlewares/handlers/asyncHandler.js";
import {
  IncidentCreateSchema,
  IncidentUpdateSchema,
  IncidentQuerySchema,
} from "../../schemas/incidents/incidentsSchema.js";

export const incidentRouter: Router = Router();

incidentRouter.use(authGuard())
