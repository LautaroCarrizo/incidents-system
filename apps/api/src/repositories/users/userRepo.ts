import { Op } from "sequelize";
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
  async create(data: {
    name: string;
    email: string;
    password: string;
    isAdmin?: boolean;
  }) {
    return UserModel.create(data);
  }

  async findById(id: number) {
    return UserModel.findByPk(id);
  }

  async findByEmail(email: string) {
    return UserModel.findOne({ where: { email } });
  }

  async existsEmail(email: string): Promise<boolean> {
    const count = await UserModel.count({ where: { email } });
    return count > 0;
  }

  async updatePartial(
    id: number,
    patch: Partial<{
      name: string;
      email: string;
      password: string;
      isAdmin: boolean;
    }>
  ) {
    const user = await UserModel.findByPk(id);
    if (!user) return null;
    await user.update(patch as any);
    return user;
  }

  async deleteHard(id: number) {
    return UserModel.destroy({ where: { id } });
  }
}
export const userRepo = new UserRepo();
