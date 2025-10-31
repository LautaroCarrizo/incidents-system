import type { Request, Response } from "express";
import type {
  AssignmentCreateInput,
  AssignmentQueryInput,
  AssignmentUpdateInput,
} from "../../schemas/assignments/assignmentsSchema.js";
import { assignmentService } from "../../services/assignment/assignmentService.js";
import type { AuthContext } from "../../auth-admin/context.js";

export async function list(
  req: Request<{}, any, any, AssignmentQueryInput>,
  res: Response
) {
  const result = await assignmentService.paginate(req.query);
  return res.json({
    success: true,
    data: result.items,
    meta: { page: result.page, pageSize: result.pageSize, total: result.total },
  });
}
export async function create(
  req: Request<{}, any, AssignmentCreateInput>,
  res: Response
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Falta token" },
    });
  }
  const actor: AuthContext = {
    userId: req.user.id,
    role: req.user.isAdmin ? "ADMIN" : "USER",
  };
  const dto = await assignmentService.create(req.body, actor);
  return res.status(201).json({ success: true, data: dto });
}
export async function update(
  req: Request<{ id: string }, any, AssignmentUpdateInput>,
  res: Response
) {
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

  const dto = await assignmentService.update(id, req.body, actor);
  return res.json({ success: true, data: dto });
}

export async function getById(req: Request<{ id: string }>, res: Response) {
  const id = Number(req.params.id);
  const dto = await assignmentService.getByIdOrThrow(id);
  return res.json({ success: true, data: dto });
}
export async function getByIncidentId(
  req: Request<{ id: string }>,
  res: Response
) {
  const id = Number(req.params.id);
  const dto = await assignmentService.getByIncidentId(id);
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

  await assignmentService.delete(id, actor);
  return res.json({ success: true, data: { ok: true } });
}
