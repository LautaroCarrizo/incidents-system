import type { Request, Response } from "express";
import type {
  AgentCreateInput,
  AgentQueryInput,
  AgentUpdateInput,
} from "../../schemas/agents/agentsSchema.js";
import { agentService } from "../../services/agent/agentService.js";
import type { AuthContext } from "../../auth-admin/context.js";

export async function list(
  req: Request<{}, any, any, AgentQueryInput>,
  res: Response
) {
  const result = await agentService.paginate(req.query);
  return res.json({
    success: true,
    data: result.items,
    meta: { page: result.page, pageSize: result.pageSize, total: result.total },
  });
}

export async function getById(req: Request<{ id: string }>, res: Response) {
  const id = Number(req.params.id);
  const dto = await agentService.getByIdOrThrow(id);
  return res.json({ success: true, data: dto });
}

export async function create(
  req: Request<{}, any, AgentCreateInput>,
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

  const dto = await agentService.create(req.body, actor);
  return res.status(201).json({ success: true, data: dto });
}

export async function update(
  req: Request<{ id: string }, any, AgentUpdateInput>,
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

  const dto = await agentService.update(id, req.body, actor);
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

  await agentService.delete(id, actor);
  return res.json({ success: true, data: { ok: true } });
}