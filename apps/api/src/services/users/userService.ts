import { userRepo } from "../../repositories/users/userRepo.js";
import type {
  UserCreateInput,
  UserQueryInput,
  UserUpdateInput,
  UserUpdateSchema,
} from "../../schemas/user/userSchema.js";

class UserService {
  async userList(query: UserQueryInput) {
    const { rows, count } = await userRepo.findAll(query);
    return {
      items: rows,
      total: count,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async create(input: UserCreateInput) {
    return userRepo.create(input);
  }
  async getByIdOrThrow(id: number) {
    const found = await userRepo.findById(id);
    if (!found) {
      const err = new Error("usuario no encontrado por id");
      (err as any).statusCode = 404;
      throw err;
    }
    return found;
  }
  async getByEmailOrThrow(email: string) {
    const found = await userRepo.findByEmail(email);
    if (!found) {
      const err = new Error("usuario no encontrado por email");
      (err as any).statusCode = 404;
      throw err;
    }
    return found;
  }

  async update(id: number, input: UserUpdateInput) {
    const userModel = await userRepo.findById(id);
    if (!userModel) {
      const err = new Error("usuario no encontrado por email");
      (err as any).statusCode = 404;
      throw err;
    }

  }
}
