import type { Request, Response } from "express";
import type {
  IncidentCreateInput,
  IncidentQueryInput,
  IncidentUpdateInput,
} from "../../schemas/incidents/incidentsSchema.js";
import { incidentService } from "../../services/incidents/incidentsService.js";

type AuthContext = { userId?: number; role?: "ADMIN" | "USER" };

export async function list(
  req: Request<{}, any, any, IncidentQueryInput>,
  res: Response
) {
  const result = await incidentService.paginate(req.query);
  return res.json({
    success: true,
    data: result.items,
    meta: { page: result.page, pageSize: result.pageSize, total: result.total },
  });
}

export async function create(
  req: Request<{}, any, IncidentCreateInput>,
  res: Response
) {
  const dto = await incidentService.create(req.body, req.user?.id);
  return res.status(201).json({ success: true, data: dto });
}

export async function getById(req: Request<{ id: string }>, res: Response) {
  const id = Number(req.params.id);
  const dto = await incidentService.getByIdOrThrow(id);
  return res.json({ success: true, data: dto });
}


export async function update(
  req: Request<{ id: string }, any, IncidentUpdateInput>,
  res: Response
) {
  const id = Number(req.params.id);
  const ctx = {
    userId: req.user?.id,
    role: req.user?.isAdmin ? "ADMIN" : "USER",
  } as AuthContext;
  const dto = await incidentService.update(id, req.body, ctx);
  return res.json({ success: true, data: dto });
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  const id = Number(req.params.id);
  const ctx = {
    userId: req.user?.id,
    role: req.user?.isAdmin ? "ADMIN" : "USER",
  } as AuthContext;
  await incidentService.softDelete(id, ctx);
  return res.json({ success: true, data: { ok: true } });
}
