import { userRepo } from "../../repositories/users/userRepo.js";
import {
  UserUpdateSchema,
  UserCreateSchema,
  type UserQueryInput,
  type UserUpdateInput,
} from "../../schemas/user/userSchema.js";
import { toUserInfoDto, toUserListDto } from "../../dtos/user/userDto.js";
import { sequelize } from "../../config/db/sequelizeConn.js";

class UserService {
  async userList(query: UserQueryInput) {
    const { rows, count } = await userRepo.findAll(query);
    return {
      items: toUserListDto(rows),
      total: count,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async create(input: unknown, _ctx?: { userId?: number }) {
    const data = UserCreateSchema.parse(input);

    const existing = await userRepo.findByEmail(data.email);
    if (existing) {
      const err = new Error("ya existe un usuario con ese email");
      (err as any).statusCode = 409;
      throw err;
    }

    const user = await sequelize.transaction(async (tx) => {
      const created = await userRepo.create(
        {
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin ?? false,
        } as any,
        tx
      );
      return created;
    });

    return toUserInfoDto(user);
  }

  async getByIdOrThrow(id: number) {
    const found = await userRepo.findById(id);
    if (!found) {
      const err = new Error("usuario no encontrado por id");
      (err as any).statusCode = 404;
      throw err;
    }
    return toUserInfoDto(found);
  }

  async getByEmailOrThrow(email: string) {
    const found = await userRepo.findByEmail(email);
    if (!found) {
      const err = new Error("usuario no encontrado por email");
      (err as any).statusCode = 404;
      throw err;
    }
    return toUserInfoDto(found);
  }

  async update(id: number, input: UserUpdateInput) {
    const data = UserUpdateSchema.parse(input);

    const updated = await sequelize.transaction(async (tx) => {
      const u = await userRepo.findById(id, tx);
      if (!u) {
        const err = new Error("usuario no encontrado por id");
        (err as any).statusCode = 404;
        throw err;
      }

      if (data.email && data.email !== u.email) {
        const existing = await userRepo.findByEmail(data.email, tx);
        if (existing) {
          const err = new Error("email ya registrado");
          (err as any).statusCode = 409;
          throw err;
        }
      }

      const userToUpdate = {
        name: data.name ?? u.name,
        email: data.email ?? u.email,
        isAdmin: data.isAdmin ?? u.isAdmin,
      };

      const saved = await userRepo.updatePartial(id, userToUpdate, tx);
      if (!saved) {
        const err = new Error("usuario no encontrado al actualizar");
        (err as any).statusCode = 404;
        throw err;
      }
      return saved;
    });

    return toUserInfoDto(updated);
  }

  async softDelete(id: number) {
    const ok = await sequelize.transaction(async (tx) => {
      return userRepo.deleteHard(id, tx);
    });

    if (!ok) {
      const err = new Error("usuario no encontrado");
      (err as any).statusCode = 404;
      throw err;
    }
  }
}

export const userService = new UserService();
