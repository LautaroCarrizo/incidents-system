import type { Request, Response } from "express";
import type {
  IncidentCreateInput,
  IncidentQueryInput,
  IncidentUpdateInput,
} from "../../schemas/incidents/incidentsSchema.js";
import { incidentService } from "../../services/incidents/incidentsService.js";
import {
  toIncidentInfoDto,
  toIncidentListDto,
} from "../../dtos/incident/incidentDto.js";
type IncidentCreateWithReporter = IncidentCreateInput & { reporterId?: number };
/**
 * GET /api/v1/incidents
 * Requiere: validate(IncidentQuerySchema, "query")
 */
export async function list(
  req: Request<{}, any, any, IncidentQueryInput>,
  res: Response
) {
  const result = await incidentService.paginate(req.query);
  return res.json({
    success: true,
    data: toIncidentListDto(result.items),
    meta: { page: result.page, pageSize: result.pageSize, total: result.total },
  });
}

/**
 * POST /api/v1/incidents
 * Requiere: validate(IncidentCreateSchema, "body")
 * Nota: si no mandan reporterId, tomamos el del token (req.user?.id) si existe
 */
export async function create(
  req: Request<{}, any, IncidentCreateInput>,
  res: Response
) {
  const tokenUserId = req.user?.id;

  const input: IncidentCreateWithReporter =
    tokenUserId != null
      ? { ...req.body, reporterId: tokenUserId } // agrega reporterId
      : { ...req.body }; // sin la clave

  const entity = await incidentService.create(input);
  return res
    .status(201)
    .json({ success: true, data: toIncidentInfoDto(entity) });
}

/**
 * GET /api/v1/incidents/:id
 */
export async function getById(req: Request<{ id: string }>, res: Response) {
  const id = Number(req.params.id);
  const entity = await incidentService.getByIdOrThrow(id);
  return res.json({ success: true, data: toIncidentInfoDto(entity) });
}

/**
 * PATCH /api/v1/incidents/:id
 * Requiere: validate(IncidentUpdateSchema, "body")
 * Regla: dueño o admin pueden editar (reglas extra de estado en el service)
 */
export async function update(
  req: Request<{ id: string }, any, IncidentUpdateInput>,
  res: Response
) {
  const id = Number(req.params.id);
  const current = await incidentService.getByIdOrThrow(id);

  // ✅ Convertimos la instancia a objeto plano
  const cur = current.get({ plain: true }) as { reporterId: number | null };

  const isOwner = cur.reporterId && req.user?.id === cur.reporterId;
  const isAdmin = !!req.user?.isAdmin;

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "No podés editar este incidente" },
    });
  }

  const updated = await incidentService.update(id, req.body);
  return res.json({ success: true, data: toIncidentInfoDto(updated) });
}

/**
 * DELETE /api/v1/incidents/:id
 * (soft/hard delete según tu modelo; acá usamos destroy simple)
 * Regla: dueño o admin
 */
export async function remove(req: Request<{ id: string }>, res: Response) {
  const id = Number(req.params.id);
  const current = await incidentService.getByIdOrThrow(id);

  // ✅ Misma conversión a objeto plano
  const cur = current.get({ plain: true }) as { reporterId: number | null };

  const isOwner = cur.reporterId && req.user?.id === cur.reporterId;
  const isAdmin = !!req.user?.isAdmin;

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "No podés eliminar este incidente" },
    });
  }

  await incidentService.softDelete(id);
  return res.json({ success: true, data: { ok: true } });
}
