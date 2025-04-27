// src/types/express/index.d.ts
declare namespace Express {
  export interface Request {
    auth?: {
      userId: string;
      sessionClaims?: {
        role?: string;
      };
    };
  }
}
