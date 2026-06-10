import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { ApiError, getParam } from "./http.js";

export interface AuthUser {
  id: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN" | "SUPPORT";
  customerId?: string;
  sellerId?: string;
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

export function authOptional(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return next();
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret);
    req.user = isAuthUser(payload) ? payload : undefined;
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

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

export function rateLimit(name: string, max = config.rateLimitMax, windowMs = config.rateLimitWindowMs) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${name}:${req.ip}`;
    const bucket = rateLimitBuckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      return next(new ApiError(429, "Too many requests. Please try again shortly.", "RATE_LIMITED"));
    }

    return next();
  };
}
