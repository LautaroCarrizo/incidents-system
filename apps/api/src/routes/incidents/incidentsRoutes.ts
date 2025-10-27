import { Router } from "express";
import { validate } from "../../middlewares/validate/validate.js";
import { authGuard } from "../../middlewares/auth/authGuard.js";
import { asyncHandler } from "../../middlewares/handlers/asyncHandler.js";

import {
  IncidentCreateSchema,
  IncidentUpdateSchema,
  IncidentQuerySchema,
} from "../../schemas/incidents/incidentsSchema.js";

import * as ctrl from "../../controllers/incidents/incidentsController.js";

export const incidentRouter: Router = Router();

// 🔒 Descomenta esta línea cuando tengas JWT activo.
// Si querés probar abierto, comentala.
 incidentRouter.use(authGuard());

// GET /api/v1/incidents?status=&typeIncident=&search=&page=&pageSize=&sort=
incidentRouter.get(
  "/",
  validate(IncidentQuerySchema, "query"),
  asyncHandler(ctrl.list)
);

// POST /api/v1/incidents
incidentRouter.post(
  "/",
  validate(IncidentCreateSchema, "body"),
  asyncHandler(ctrl.create)
);

// GET /api/v1/incidents/:id
incidentRouter.get("/:id", asyncHandler(ctrl.getById));

// PATCH /api/v1/incidents/:id
incidentRouter.patch(
  "/:id",
  validate(IncidentUpdateSchema, "body"),
  asyncHandler(ctrl.update)
);

// DELETE /api/v1/incidents/:id
incidentRouter.delete("/:id", asyncHandler(ctrl.remove));
