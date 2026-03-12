import { Role as UserRole } from "@prisma/client";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: UserRole;
    };
  }
}

export {};