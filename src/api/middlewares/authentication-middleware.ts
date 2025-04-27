import { Request, Response, NextFunction } from "express";
import UnauthorizedError from "../../domain/errors/UnauthorizedError";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // First check if req.auth exists
  if (!req.auth || !req.auth.userId) {
    throw new UnauthorizedError("unauthorized");
  }
  
  next();
};


