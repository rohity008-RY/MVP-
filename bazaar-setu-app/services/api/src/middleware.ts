import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

export interface AuthUser {
  id: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN" | "SUPPORT";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authOptional(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return next();
  try {
    req.user = jwt.verify(header.slice(7), config.jwtSecret) as AuthUser;
  } catch {
    req.user = undefined;
  }
  return next();
}

export function requireRole(...roles: AuthUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ ok: false, error: "Authentication required" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ ok: false, error: "Forbidden" });
    return next();
  };
}
