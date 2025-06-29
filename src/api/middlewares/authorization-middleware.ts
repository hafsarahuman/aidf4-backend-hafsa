import { Request, Response, NextFunction } from "express";
import ForbiddenError from "../../domain/errors/ForbiddenError";


export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  //@ts-ignore
  if (req.auth.sessionClaims?.role !== "admin") {
    throw new ForbiddenError("Only administrators are allowed to perform this action"); 
  }
  
  next();
};