import { Op, type Transaction } from "sequelize";
import { UserModel } from "../../models/users/user.js";

class UserRepo {
  async findAll(params: {
    page: number;
    pageSize: number;
    search?: string | undefined;
    sort?: string | undefined;
    isAdmin?: boolean | undefined;
  }) {
    const { page, pageSize, search, sort, isAdmin } = params;

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

    const { rows, count } = await UserModel.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order,
    });

    return { rows, count, page, pageSize };
  }

  async create(
    data: {
      name: string;
      email: string;
      password?: string;
      isAdmin?: boolean;
    },
    tx?: Transaction | null
  ) {
    return UserModel.create(data as any, tx ? { transaction: tx } : undefined);
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
    patch: Partial<{
      name: string;
      email: string;
      password?: string;
      isAdmin: boolean;
    }>,
    tx?: Transaction | null
  ) {
    const user = await UserModel.findByPk(
      id,
      tx ? { transaction: tx } : undefined
    );
    if (!user) return null;

    await user.update(patch as any, tx ? { transaction: tx } : undefined);
    return user;
  }

  async deleteHard(id: number, tx?: Transaction | null) {
    return UserModel.destroy({
      where: { id },
      ...(tx ? { transaction: tx } : {}),
    });
  }
}

export const userRepo = new UserRepo();
