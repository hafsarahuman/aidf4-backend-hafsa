import { Request, Response, NextFunction } from "express";
import ForbiddenError from "../../domain/errors/ForbiddenError";


export const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  if (!(req?.auth?.sessionClaims?.role === "admin")) {
    throw new ForbiddenError("Forbidden"); 
  }
  console.log(req.auth);
  next();
};