import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { writeAuditLog } from "../audit-log.js";
import { approveProductRequest, rejectProductRequest } from "../catalogue-approval-service.js";
import { prisma } from "../db.js";
import { ApiError, asyncHandler, getParam, sendOk } from "../http.js";
import { requireRole } from "../middleware.js";
import { defaultPaymentConfig, defaultRewardConfig } from "../platform-config.js";

export const adminRouter = Router();
adminRouter.use(requireRole("ADMIN", "SUPPORT"));

const defaultSettings = {
  paymentConfig: defaultPaymentConfig,
  rewardConfig: defaultRewardConfig
};

adminRouter.get("/dashboard", asyncHandler(async (_req, res) => {
  const [orders, sellers, productRequests, notifications] = await Promise.all([
    prisma.parentOrder.count(),
    prisma.sellerProfile.count(),
    prisma.productApprovalRequest.count({ where: { status: "PENDING" } }),
    prisma.notification.count()
  ]);
  return sendOk(res, { orders, sellers, productRequests, notifications });
}));

adminRouter.get("/orders", asyncHandler(async (_req, res) => {
  const orders = await prisma.parentOrder.findMany({
    include: { subOrders: { include: { seller: true, items: true } }, address: true },
    orderBy: { createdAt: "desc" }
  });
  return sendOk(res, orders);
}));

adminRouter.get("/sellers", asyncHandler(async (_req, res) => {
  const sellers = await prisma.sellerProfile.findMany({
    include: { user: true, locations: true, documents: true, products: true }
  });
  return sendOk(res, sellers);
}));

adminRouter.post("/staff-users", requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const input = z.object({
    phone: z.string().min(10).transform((phone) => phone.trim()),
    name: z.string().min(2),
    email: z.string().email().optional(),
    role: z.enum(["ADMIN", "SUPPORT"])
  }).parse(req.body);

  const existing = await prisma.user.findUnique({ where: { phone: input.phone } });
  if (existing && !["ADMIN", "SUPPORT"].includes(existing.role)) {
    throw new ApiError(409, "This phone number already belongs to a customer or seller.", "PHONE_ROLE_CONFLICT");
  }

  const user = await prisma.user.upsert({
    where: { phone: input.phone },
    update: { name: input.name, email: input.email, role: input.role },
    create: input
  });

  await writeAuditLog(req, {
    action: existing ? "staff_user_updated" : "staff_user_created",
    entityType: "User",
    entityId: user.id,
    metadata: { phone: user.phone, role: user.role }
  });

  return sendOk(res, user, existing ? 200 : 201);
}));

adminRouter.get("/seller-leads", asyncHandler(async (_req, res) => {
  const leads = await prisma.sellerLead.findMany({ orderBy: { createdAt: "desc" } });
  return sendOk(res, leads);
}));

adminRouter.patch("/seller-leads/:leadId", asyncHandler(async (req, res) => {
  const leadId = getParam(req, "leadId");
  const input = z.object({
    status: z.enum(["NEW", "CONTACTED", "ONBOARDED", "REJECTED"]),
    notes: z.string().optional()
  }).parse(req.body);
  const lead = await prisma.sellerLead.update({ where: { id: leadId }, data: input });
  await writeAuditLog(req, {
    action: "seller_lead_updated",
    entityType: "SellerLead",
    entityId: lead.id,
    metadata: input
  });
  return sendOk(res, lead);
}));

adminRouter.get("/product-requests", asyncHandler(async (_req, res) => {
  const requests = await prisma.productApprovalRequest.findMany({
    include: { seller: true },
    orderBy: { createdAt: "desc" }
  });
  return sendOk(res, requests);
}));

adminRouter.patch("/product-requests/:requestId", asyncHandler(async (req, res) => {
  const requestId = getParam(req, "requestId");
  const input = z
    .object({
      status: z.enum(["APPROVED", "REJECTED"]),
      reason: z.string().optional()
    })
    .superRefine((value, ctx) => {
      if (value.status === "REJECTED" && !value.reason?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reason"],
          message: "Reject reason is required."
        });
      }
    })
    .parse(req.body);

  const request = input.status === "APPROVED"
    ? await approveProductRequest(requestId, input.reason)
    : await rejectProductRequest(requestId, input.reason?.trim() ?? "");

  await writeAuditLog(req, {
    action: input.status === "APPROVED" ? "product_request_approved" : "product_request_rejected",
    entityType: "ProductApprovalRequest",
    entityId: request.id,
    metadata: { status: input.status, reason: input.reason }
  });

  return sendOk(res, request);
}));

adminRouter.get("/notifications", asyncHandler(async (_req, res) => {
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" } });
  return sendOk(res, notifications);
}));

adminRouter.post("/notifications", asyncHandler(async (req, res) => {
  const input = z.object({
    audience: z.enum(["customer", "seller", "admin", "all"]),
    type: z.enum(["offer", "order", "system", "approval", "refund"]),
    title: z.string(),
    body: z.string()
  }).parse(req.body);
  const notification = await prisma.notification.create({ data: input });
  await writeAuditLog(req, {
    action: "notification_published",
    entityType: "Notification",
    entityId: notification.id,
    metadata: input
  });
  return sendOk(res, notification, 201);
}));

adminRouter.get("/settings", asyncHandler(async (_req, res) => {
  const settings = await prisma.platformSetting.findMany();
  const data = {
    ...defaultSettings,
    ...Object.fromEntries(settings.map((setting) => [setting.key, setting.value]))
  };
  return sendOk(res, data);
}));

adminRouter.patch("/settings", asyncHandler(async (req, res) => {
  const input = z.object({
    paymentConfig: z.unknown().optional(),
    rewardConfig: z.unknown().optional()
  }).parse(req.body);
  if (!Object.keys(input).length) {
    throw new ApiError(400, "At least one setting must be provided.", "EMPTY_SETTINGS_UPDATE");
  }

  await Promise.all(
    Object.entries(input).filter(([, value]) => value !== undefined).map(([key, value]) => {
      const jsonValue = value as Prisma.InputJsonValue;
      return prisma.platformSetting.upsert({
        where: { key },
        update: { value: jsonValue },
        create: { key, value: jsonValue }
      });
    })
  );

  await writeAuditLog(req, {
    action: "platform_settings_updated",
    entityType: "PlatformSetting",
    metadata: input as Prisma.InputJsonValue
  });

  const settings = await prisma.platformSetting.findMany();
  const data = {
    ...defaultSettings,
    ...Object.fromEntries(settings.map((setting) => [setting.key, setting.value]))
  };
  return sendOk(res, data);
}));

adminRouter.get("/audit-logs", requireRole("ADMIN"), asyncHandler(async (req, res) => {
  const query = z.object({
    action: z.string().optional(),
    entityType: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(200).default(100)
  }).parse(req.query);

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(query.action ? { action: query.action } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {})
    },
    orderBy: { createdAt: "desc" },
    take: query.limit
  });
  return sendOk(res, logs);
}));
