import type { Prisma } from "@prisma/client";
import type { Request } from "express";
import { prisma } from "./db.js";

interface AuditInput {
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

export async function writeAuditLog(req: Request, input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: req.user?.id,
        actorRole: req.user?.role,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata: input.metadata,
        ipAddress: req.ip,
        userAgent: req.header("user-agent")
      }
    });
  } catch (error) {
    console.warn("Audit log write skipped", error instanceof Error ? error.message : error);
  }
}
