export type Role = "ADMIN" | "USER";

export interface AuthContext {
  userId: number;
  role: Role;
}