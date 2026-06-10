import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { config } from "./config.js";

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, message: string, code = "API_ERROR", details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(handler: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function sendOk(res: Response, data: unknown, statusCode = 200) {
  return res.status(statusCode).json({ ok: true, data });
}

export function getParam(req: Request, name: string) {
  const value = req.params[name];
  if (!value || Array.isArray(value)) {
    throw new ApiError(400, `Invalid route parameter: ${name}.`, "INVALID_ROUTE_PARAM");
  }
  return value;
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, "ROUTE_NOT_FOUND"));
};

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.requestId;

  if (error instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        details: error.flatten(),
        requestId
      }
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return res.status(404).json({
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Requested record was not found.",
          requestId
        }
      });
    }
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId
      }
    });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";
  if (!config.isProduction) {
    console.error(error);
  }

  return res.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: config.isProduction ? "Unexpected server error." : message,
      requestId
    }
  });
}
