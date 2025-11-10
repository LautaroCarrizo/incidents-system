import jwt, {type Secret, type SignOptions} from "jsonwebtoken";
import type { StringValue as MsString } from "ms";

const JWT_ACCESS_SECRET: Secret = process.env.JWT_ACCESS_SECRET || "dev-secret";
const JWT_ACCESS_TTL: MsString = (process.env.JWT_ACCESS_TTL ?? 900) as MsString;

type AccessPayload = { sub: string; isAdmin: boolean };

export function signAccessToken(user: { id: number; isAdmin: boolean }) {
  const payload: AccessPayload = { sub: String(user.id), isAdmin: !!user.isAdmin };
  const options: SignOptions = { expiresIn: JWT_ACCESS_TTL, algorithm: "HS256" };
  return jwt.sign(payload, JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_ACCESS_SECRET) as AccessPayload & { iat: number; exp: number };
}