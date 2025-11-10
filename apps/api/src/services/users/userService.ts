import { userRepo } from "../../repositories/users/userRepo.js";
import {
  UserUpdateSchema,
  UserCreateSchema,
  type UserQueryInput,
  type UserUpdateInput,
  type UserCreateInput,
} from "../../schemas/user/userSchema.js";
import { toUserInfoDto, toUserListDto } from "../../dtos/user/userDto.js";
import { sequelize } from "../../config/db/sequelizeConn.js";
import bcrypt from "bcrypt";
class UserService {
  async userList(query: UserQueryInput) {
    const { rows, count } = await userRepo.findAll(query);
    return {
      items: rows.map(toUserListDto),
      total: count,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async create(input: unknown) {
    const data = UserCreateSchema.parse(input);
    const email = data.email.trim().toLowerCase();
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      const err = new Error("ya existe un usuario con ese email");
      (err as any).statusCode = 409;
      throw err;
    }
    const hashed = await bcrypt.hash(data.password, 10);
    const dto: UserCreateInput = {
      name: data.name,
      email: email,
      password: hashed,
      isAdmin: data.isAdmin ?? false,
    };

    const user = await sequelize.transaction(async (tx) => {
      return userRepo.create(dto, tx);
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
      let nextEmail = data.email ?? u.email;
      if (data.email) {
        nextEmail = data.email.trim().toLowerCase();
        if (nextEmail !== u.email) {
          const existing = await userRepo.findByEmail(nextEmail, tx);
          if (existing) {
            const err = new Error("email ya registrado");
            (err as any).statusCode = 409;
            throw err;
          }
        }
      }
      const userToUpdate = {
        name: data.name ?? u.name,
        email: nextEmail,
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

  async changePassword(id: number, current: string, next: string) {
    await sequelize.transaction(async (tx) => {
      const u = await userRepo.findById(id, tx);
      if (!u) {
        const e = new Error("usuario no encontrado");
        (e as any).statusCode = 404;
        throw e;
      }

      const stored = u.password ?? "";
      const isHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(stored);
      const ok = isHash
        ? await bcrypt.compare(current, stored)
        : stored === current;
      if (!ok) {
        const e = new Error("contraseña actual inválida");
        (e as any).statusCode = 401;
        throw e;
      }

      const hashed = await bcrypt.hash(next, 10);
      const updated = await userRepo.updatePassword(id, hashed, tx);
      if (!updated) {
        const e = new Error("falló la actualización de contraseña");
        (e as any).statusCode = 500;
        throw e;
      }
    });
  }
  async hardDelete(id: number) {
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
