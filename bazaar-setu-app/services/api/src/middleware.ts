import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { prisma } from "./db.js";
import { ApiError, getParam } from "./http.js";
import { incrementRateLimit } from "./rate-limit-store.js";

export interface AuthUser {
  id: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN" | "SUPPORT";
  customerId?: string;
  sellerId?: string;
  sessionId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      requestId?: string;
    }
  }
}

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const incomingRequestId = req.header("x-request-id");
  req.requestId = incomingRequestId && incomingRequestId.length <= 100 ? incomingRequestId : randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
}

function isAuthUser(payload: string | jwt.JwtPayload): payload is AuthUser {
  if (!payload || typeof payload === "string") return false;
  return (
    typeof payload.id === "string" &&
    ["CUSTOMER", "SELLER", "ADMIN", "SUPPORT"].includes(String(payload.role))
  );
}

export async function authOptional(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return next();
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret);
    if (!isAuthUser(payload)) return next();
    if (!payload.sessionId && config.demoAuthEnabled) {
      req.user = payload;
      return next();
    }
    if (!payload.sessionId) return next();

    const session = await prisma.authSession.findUnique({ where: { id: payload.sessionId } });
    if (!session || session.userId !== payload.id || session.revokedAt || session.expiresAt <= new Date()) return next();
    req.user = payload;
  } catch {
    req.user = undefined;
  }
  return next();
}

export function requireRole(...roles: AuthUser["role"][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user && config.demoAuthEnabled) return next();
    if (!req.user) return next(new ApiError(401, "Authentication required.", "AUTH_REQUIRED"));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, "Forbidden.", "FORBIDDEN"));
    return next();
  };
}

export function requireCustomerAccess(paramName = "customerId") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const customerId = getParam(req, paramName);
    if (!req.user && config.demoAuthEnabled) return next();
    if (!req.user) return next(new ApiError(401, "Authentication required.", "AUTH_REQUIRED"));
    if (["ADMIN", "SUPPORT"].includes(req.user.role)) return next();
    if (config.demoAuthEnabled && !req.user.customerId) return next();
    if (req.user.role === "CUSTOMER" && req.user.customerId === customerId) return next();
    return next(new ApiError(403, "Customer access denied.", "CUSTOMER_ACCESS_DENIED"));
  };
}

export function requireSellerAccess(paramName = "sellerId") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const sellerId = getParam(req, paramName);
    if (!req.user && config.demoAuthEnabled) return next();
    if (!req.user) return next(new ApiError(401, "Authentication required.", "AUTH_REQUIRED"));
    if (["ADMIN", "SUPPORT"].includes(req.user.role)) return next();
    if (config.demoAuthEnabled && !req.user.sellerId) return next();
    if (req.user.role === "SELLER" && req.user.sellerId === sellerId) return next();
    return next(new ApiError(403, "Seller access denied.", "SELLER_ACCESS_DENIED"));
  };
}

export function rateLimit(name: string, max = config.rateLimitMax, windowMs = config.rateLimitWindowMs) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `rl:${name}:${req.ip}`;
      const result = await incrementRateLimit(key, max, windowMs);
      res.setHeader("x-ratelimit-limit", String(max));
      res.setHeader("x-ratelimit-remaining", String(result.remaining));
      res.setHeader("x-ratelimit-store", result.store);

      if (!result.allowed) {
        res.setHeader("retry-after", String(Math.ceil(result.retryAfterMs / 1000)));
        return next(new ApiError(429, "Too many requests. Please try again shortly.", "RATE_LIMITED"));
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
