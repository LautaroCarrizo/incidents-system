import type { Request, Response } from "express";
import type {
  UserCreateInput,
  UserQueryInput,
  UserUpdateInput,
} from "../../schemas/user/userSchema.js";
import { userService } from "../../services/users/userService.js";

export async function list(
  req: Request<{}, any, any, UserQueryInput>,
  res: Response
) {
  const dto = await userService.userList(req.query);
  return res.json({ success: true, data: dto });
}
export async function create(
  req: Request<{}, any, UserCreateInput>,
  res: Response
) {
  const dto = await userService.create(req.body);
  return res.status(201).json({ success: true, data: dto });
}
export async function getById(req: Request<{ id: string }>, res: Response) {
  const id = Number(req.params.id);
  const dto = await userService.getByIdOrThrow(id);
  return res.json({ success: true, data: dto });
}
export async function getByEmail(req: Request, res: Response) {
  const email = String(req.params.email);
  const dto = await userService.getByEmailOrThrow(email);
  return res.json({ success: true, data: dto });
}
export async function update(
  req: Request<{ id: string }, any, UserUpdateInput>,
  res: Response
) {
  const id = Number(req.params.id);
  const updated = await userService.update(id, req.body);
  return res.json({ success: true, data: updated });
}
export async function changePassword(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Falta token" },
    });
  }

  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user.id, currentPassword, newPassword);

  return res.status(204).send();
}
export async function remove(req: Request<{ id: string }>, res: Response) {
  const id = Number(req.params.id);
  await userService.hardDelete(id);
  return res.json({ success: true, ok: true });
}
