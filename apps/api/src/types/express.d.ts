export {};

declare global {
  namespace Express {
    interface UserClaims {
      id: number;
      isAdmin: boolean;
      // roles?: string[]; // si luego usás RBAC por roles
    }
    interface Request {
      user?: UserClaims;
    }
  }
}
