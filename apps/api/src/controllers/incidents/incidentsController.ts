import type { Request, Response } from "express";
import type {
  IncidentCreateInput,
  IncidentQueryInput,
  IncidentUpdateInput,
} from "../../schemas/incidents/incidentsSchema.js";
import { incidentService } from "../../services/incidents/incidentsService.js";
import type { AuthContext } from "../../auth-admin/context.js";

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
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid incident ID',
      },
    });
  }
  const dto = await incidentService.getByIdOrThrow(id);
  return res.json({ success: true, data: dto });
}

export async function update(
  req: Request<{ id: string }, any, IncidentUpdateInput>,
  res: Response
) {

  const id = Number(req.params.id);

  const dto = await incidentService.update(id, req.body, req.user);
  return res.json({ success: true, data: dto });
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Falta token" },
    });
  }

  const id = Number(req.params.id);
  const actor: AuthContext = {
    userId: req.user.id,
    role: req.user.isAdmin ? "ADMIN" : "USER",
  };

  await incidentService.delete(id, actor);
  return res.json({ success: true, data: { ok: true } });
}
