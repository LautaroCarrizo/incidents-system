import bcrypt from "bcrypt";
import { userRepo } from "../../repositories/users/userRepo.js";
import { signAccessToken } from "../../utils/token.js";
import { toUserInfoDto } from "../../dtos/user/userDto.js";

function isBcryptHash(s: string) {
  return typeof s === "string" && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(s);
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}) {
  const email = input.email.trim().toLowerCase();

  const exists = await userRepo.findByEmail(email);
  if (exists) {
    const err = new Error("Email ya registrado");
    (err as any).statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(input.password, 10);

  const user = await userRepo.create({
    name: input.name,
    email,
    password: hashed,
    isAdmin: input.isAdmin ?? false, // en prod, controlalo con requireAdmin()
  });

  const accessToken = signAccessToken({
    id: Number(user.id),
    isAdmin: !!user.isAdmin,
  });

  return { user: toUserInfoDto(user), accessToken };
}

export async function login(input: { email: string; password: string }) {
  const bad = () => { const e = new Error("Credenciales inválidas"); (e as any).statusCode = 401; throw e; };

  const email = input.email.trim().toLowerCase();
  const user = await userRepo.findByEmail(email);
  if (!user) { bad(); return; }

  const stored = user.password ?? "";
  let ok = false;

  if (isBcryptHash(stored)) {
    ok = await bcrypt.compare(input.password, stored);
  } else {
    ok = stored === input.password;
    if (ok) {
      try {
        await user.update({ password: await bcrypt.hash(input.password, 10) });
      } catch {  }
    }
  }

  if (!ok) bad();

  const accessToken = signAccessToken({
    id: Number(user.id),
    isAdmin: !!user.isAdmin,
  });

  return { user: toUserInfoDto(user), accessToken };
}
