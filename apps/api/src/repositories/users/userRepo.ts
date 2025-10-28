import { Op, type Transaction } from "sequelize";
import {
  UserModel,
  type UserCreationAttributes,
  type UserAttributes,
} from "../../models/users/user.js";
import type { UserQueryInput } from "../../schemas/user/userSchema.js";

class UserRepo {
  async findAll(query: UserQueryInput, tx?: Transaction | null) {
    const { page, pageSize, search, sort, isAdmin } = query;

    const where: any = {};
    if (typeof isAdmin === "boolean") where.isAdmin = isAdmin;

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    let order: any = [["id", "ASC"]];
    if (sort) {
      const dir = sort.startsWith("-") ? "DESC" : "ASC";
      const field = sort.replace(/^[+-]/, "");
      order = [[field, dir]];
    }

    const offset = (page - 1) * pageSize;

    const { rows, count } = await UserModel.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order,
      ...(tx ? { transaction: tx } : {}),
    });

    return { rows, count, page, pageSize };
  }
  async create(
    data: { name: string; email: string; password: string; isAdmin?: boolean },
    tx?: Transaction | null
  ) {
    return UserModel.create(
      {
        id: undefined,
        name: data.name,
        email: data.email,
        password: data.password,
        isAdmin: data.isAdmin ?? false,
      },
      tx ? { transaction: tx } : undefined
    );
  }

  async findById(id: number, tx?: Transaction | null) {
    return UserModel.findByPk(id, tx ? { transaction: tx } : undefined);
  }

  async findByEmail(email: string, tx?: Transaction | null) {
    return UserModel.findOne({
      where: { email },
      ...(tx ? { transaction: tx } : {}),
    });
  }

  async existsEmail(email: string, tx?: Transaction | null): Promise<boolean> {
    const count = await UserModel.count({
      where: { email },
      ...(tx ? { transaction: tx } : {}),
    });
    return count > 0;
  }

  async updatePartial(
    id: number,
    patch: Partial<Pick<UserAttributes, "name" | "email" | "isAdmin">>,
    tx?: Transaction | null
  ) {
    const user = await UserModel.findByPk(
      id,
      tx ? { transaction: tx } : undefined
    );
    if (!user) return null;
    await user.update(patch, tx ? { transaction: tx } : undefined);
    return user;
  }

  async deleteHard(id: number, tx?: Transaction | null) {
    const n = await UserModel.destroy({
      where: { id },
      ...(tx ? { transaction: tx } : {}),
    });
    return n > 0;
  }
}

export const userRepo = new UserRepo();
