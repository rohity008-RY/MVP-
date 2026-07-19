import type { OrderStatus, PaymentState, Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { writeAuditLog } from "../audit-log.js";
import { approveProductRequest, rejectProductRequest } from "../catalogue-approval-service.js";
import { prisma } from "../db.js";
import { ApiError, asyncHandler, getParam, sendOk } from "../http.js";
import { rollupParentOrder } from "../order-service.js";
import { requireRole } from "../middleware.js";
import { addSupportMessage, supportTicketInclude } from "../support-service.js";

export const opsRouter = Router();
opsRouter.use(requireRole("ADMIN", "SUPPORT"));

const activeOrderStatuses: OrderStatus[] = ["PLACED", "CONFIRMED", "INVOICE_REQUIRED", "BAG_PACKED", "HANDED_OVER"];
const orderStatusSchema = z.enum([
  "PLACED",
  "CONFIRMED",
  "INVOICE_REQUIRED",
  "BAG_PACKED",
  "HANDED_OVER",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
  "REFUNDED"
]);
const paymentStateSchema = z.enum(["PENDING", "PAID", "COD", "REFUND_PENDING", "REFUNDED", "FAILED"]);
const supportStatusSchema = z.enum(["NEW", "ASSIGNED", "WAITING_CUSTOMER", "WAITING_SELLER", "WAITING_DELIVERY", "REFUND_REVIEW", "RESOLVED", "REOPENED"]);
const supportPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function appendTimeline(timeline: Prisma.JsonValue, event: Record<string, unknown>) {
  const current = Array.isArray(timeline) ? timeline : [];
  return [...current, { ...event, at: new Date().toISOString() }] as Prisma.InputJsonValue;
}

function mapGroupCounts<T extends string>(rows: Array<{ status?: T; paymentState?: T; _count: number }>, key: "status" | "paymentState") {
  return Object.fromEntries(rows.map((row) => [row[key], row._count]));
}

function buildSlaWhere(sla?: "breached" | "dueSoon" | "all"): Prisma.SellerSubOrderWhereInput {
  const now = new Date();
  if (sla === "breached") {
    return { status: { in: activeOrderStatuses }, slaDueAt: { lt: now } };
  }
  if (sla === "dueSoon") {
    return {
      status: { in: activeOrderStatuses },
      slaDueAt: { gte: now, lte: new Date(now.getTime() + 30 * 60_000) }
    };
  }
  return {};
}

opsRouter.get("/dashboard", asyncHandler(async (_req, res) => {
  const today = startOfToday();
  const [
    totalOrders,
    todayOrders,
    todayRevenue,
    liveSellers,
    disabledSellers,
    pendingProductRequests,
    pendingDocuments,
    activeSubOrders,
    breachedSla,
    dueSoonSla,
    pendingRefunds,
    sellerLeads,
    openSupportTickets,
    criticalSupportTickets,
    dueSupportTickets,
    statusGroups,
    paymentGroups
  ] = await Promise.all([
    prisma.parentOrder.count(),
    prisma.parentOrder.count({ where: { createdAt: { gte: today } } }),
    prisma.parentOrder.aggregate({ where: { createdAt: { gte: today } }, _sum: { total: true, deliveryFee: true } }),
    prisma.sellerProfile.count({ where: { storeLive: true } }),
    prisma.sellerProfile.count({ where: { storeLive: false } }),
    prisma.productApprovalRequest.count({ where: { status: "PENDING" } }),
    prisma.complianceDocument.count({ where: { status: "PENDING" } }),
    prisma.sellerSubOrder.count({ where: { status: { in: activeOrderStatuses } } }),
    prisma.sellerSubOrder.count({ where: buildSlaWhere("breached") }),
    prisma.sellerSubOrder.count({ where: buildSlaWhere("dueSoon") }),
    prisma.sellerSubOrder.count({ where: { paymentState: "REFUND_PENDING" } }),
    prisma.sellerLead.count({ where: { status: { in: ["NEW", "CONTACTED"] } } }),
    prisma.supportTicket.count({ where: { status: { not: "RESOLVED" } } }),
    prisma.supportTicket.count({ where: { status: { not: "RESOLVED" }, priority: { in: ["HIGH", "CRITICAL"] } } }),
    prisma.supportTicket.count({ where: { status: { not: "RESOLVED" }, slaDueAt: { lt: new Date() } } }),
    prisma.sellerSubOrder.groupBy({ by: ["status"], _count: true }),
    prisma.sellerSubOrder.groupBy({ by: ["paymentState"], _count: true })
  ]);

  return sendOk(res, {
    totalOrders,
    todayOrders,
    todayRevenue: (todayRevenue._sum.total ?? 0) + (todayRevenue._sum.deliveryFee ?? 0),
    liveSellers,
    disabledSellers,
    pendingProductRequests,
    pendingDocuments,
    activeSubOrders,
    breachedSla,
    dueSoonSla,
    pendingRefunds,
    sellerLeads,
    openSupportTickets,
    criticalSupportTickets,
    dueSupportTickets,
    statusCounts: mapGroupCounts(statusGroups, "status"),
    paymentCounts: mapGroupCounts(paymentGroups, "paymentState")
  });
}));

opsRouter.get("/orders", asyncHandler(async (req, res) => {
  const query = z.object({
    status: orderStatusSchema.optional(),
    paymentState: paymentStateSchema.optional(),
    sellerId: z.string().optional(),
    sla: z.enum(["breached", "dueSoon", "all"]).optional(),
    q: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(200).default(100)
  }).parse(req.query);

  const where: Prisma.SellerSubOrderWhereInput = {
    ...buildSlaWhere(query.sla),
    ...(query.status ? { status: query.status } : {}),
    ...(query.paymentState ? { paymentState: query.paymentState } : {}),
    ...(query.sellerId ? { sellerId: query.sellerId } : {})
  };

  const orders = await prisma.sellerSubOrder.findMany({
    where,
    include: {
      seller: { include: { user: true } },
      items: true,
      parentOrder: { include: { address: true, customer: { include: { user: true } } } }
    },
    orderBy: [{ slaDueAt: "asc" }, { updatedAt: "desc" }],
    take: query.limit
  });

  const search = query.q?.trim().toLowerCase();
  const filtered = search
    ? orders.filter((order) => {
        const haystack = [
          order.id,
          order.parentOrderId,
          order.invoiceNumber,
          order.seller.shopName,
          order.seller.user.phone,
          order.parentOrder.customer.user.name,
          order.parentOrder.customer.user.phone,
          ...order.items.map((item) => item.name)
        ].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(search);
      })
    : orders;

  return sendOk(res, filtered);
}));

opsRouter.get("/sla", asyncHandler(async (req, res) => {
  const query = z.object({
    state: z.enum(["breached", "dueSoon", "all"]).default("all")
  }).parse(req.query);
  const now = Date.now();
  const orders = await prisma.sellerSubOrder.findMany({
    where: buildSlaWhere(query.state),
    include: {
      seller: true,
      items: true,
      parentOrder: { include: { address: true, customer: { include: { user: true } } } }
    },
    orderBy: [{ slaDueAt: "asc" }, { updatedAt: "desc" }],
    take: 100
  });

  return sendOk(res, orders.map((order) => ({
    ...order,
    slaMinutesRemaining: order.slaDueAt ? Math.round((order.slaDueAt.getTime() - now) / 60_000) : null,
    slaBreached: order.slaDueAt ? order.slaDueAt.getTime() < now && activeOrderStatuses.includes(order.status) : false
  })));
}));

opsRouter.patch("/sub-orders/:subOrderId/note", asyncHandler(async (req, res) => {
  const subOrderId = getParam(req, "subOrderId");
  const input = z.object({
    note: z.string().min(2),
    tag: z.enum(["support_note", "customer_call", "seller_call", "delivery_exception", "refund_note"]).default("support_note")
  }).parse(req.body);

  const current = await prisma.sellerSubOrder.findUnique({ where: { id: subOrderId } });
  if (!current) throw new ApiError(404, "Sub-order not found.", "SUB_ORDER_NOT_FOUND");

  const order = await prisma.sellerSubOrder.update({
    where: { id: subOrderId },
    data: {
      timeline: appendTimeline(current.timeline, {
        status: current.status,
        tag: input.tag,
        note: input.note
      })
    }
  });
  await writeAuditLog(req, {
    action: "ops_note_added",
    entityType: "SellerSubOrder",
    entityId: order.id,
    metadata: input
  });
  return sendOk(res, order);
}));

opsRouter.get("/refunds", asyncHandler(async (req, res) => {
  const query = z.object({
    state: z.enum(["pending", "refunded", "all"]).default("pending")
  }).parse(req.query);
  const where: Prisma.SellerSubOrderWhereInput = query.state === "all"
    ? { OR: [{ paymentState: { in: ["REFUND_PENDING", "REFUNDED"] } }, { status: { in: ["REJECTED", "CANCELLED", "REFUNDED"] } }] }
    : query.state === "refunded"
      ? { paymentState: "REFUNDED" }
      : { paymentState: "REFUND_PENDING" };

  const refunds = await prisma.sellerSubOrder.findMany({
    where,
    include: {
      seller: true,
      items: true,
      parentOrder: { include: { customer: { include: { user: true } } } }
    },
    orderBy: { updatedAt: "desc" }
  });
  return sendOk(res, refunds);
}));

opsRouter.patch("/refunds/:subOrderId", asyncHandler(async (req, res) => {
  const subOrderId = getParam(req, "subOrderId");
  const input = z.object({
    action: z.enum(["markPending", "markRefunded"]),
    refundAmount: z.number().int().nonnegative().optional(),
    note: z.string().optional()
  }).parse(req.body);

  const current = await prisma.sellerSubOrder.findUnique({ where: { id: subOrderId } });
  if (!current) throw new ApiError(404, "Sub-order not found.", "SUB_ORDER_NOT_FOUND");

  const paymentState: PaymentState = input.action === "markRefunded" ? "REFUNDED" : "REFUND_PENDING";
  const status: OrderStatus | undefined = input.action === "markRefunded" ? "REFUNDED" : undefined;
  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.sellerSubOrder.update({
      where: { id: subOrderId },
      data: {
        paymentState,
        ...(status ? { status } : {}),
        refundAmount: input.refundAmount ?? current.refundAmount,
        timeline: appendTimeline(current.timeline, {
          status: status ?? current.status,
          tag: "refund",
          note: input.note ?? (input.action === "markRefunded" ? "Refund marked as completed by Ops." : "Refund marked as pending by Ops."),
          paymentState
        })
      }
    });
    await rollupParentOrder(tx, updated.parentOrderId);
    return updated;
  });
  await writeAuditLog(req, {
    action: input.action === "markRefunded" ? "refund_marked_refunded" : "refund_marked_pending",
    entityType: "SellerSubOrder",
    entityId: order.id,
    metadata: input
  });
  return sendOk(res, order);
}));

opsRouter.get("/support-tickets", asyncHandler(async (req, res) => {
  const query = z.object({
    status: supportStatusSchema.optional(),
    priority: supportPrioritySchema.optional(),
    assignedToUserId: z.string().optional(),
    q: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(200).default(100)
  }).parse(req.query);

  const tickets = await prisma.supportTicket.findMany({
    where: {
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.assignedToUserId ? { assignedToUserId: query.assignedToUserId } : {})
    },
    include: supportTicketInclude,
    orderBy: [{ priority: "desc" }, { slaDueAt: "asc" }, { updatedAt: "desc" }],
    take: query.limit
  });

  const search = query.q?.trim().toLowerCase();
  const filtered = search
    ? tickets.filter((ticket) => {
        const haystack = [
          ticket.ticketNumber,
          ticket.subject,
          ticket.description,
          ticket.category,
          ticket.customer?.user.name,
          ticket.customer?.user.phone,
          ticket.seller?.shopName,
          ticket.seller?.user.phone,
          ticket.parentOrderId,
          ticket.subOrderId
        ].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(search);
      })
    : tickets;

  return sendOk(res, filtered);
}));

opsRouter.patch("/support-tickets/:ticketId", asyncHandler(async (req, res) => {
  const ticketId = getParam(req, "ticketId");
  const input = z.object({
    status: supportStatusSchema.optional(),
    priority: supportPrioritySchema.optional(),
    assignedToUserId: z.string().optional(),
    internalNote: z.string().optional(),
    customerReply: z.string().optional(),
    sellerReply: z.string().optional()
  }).parse(req.body);

  const existing = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!existing) throw new ApiError(404, "Support ticket not found.", "SUPPORT_TICKET_NOT_FOUND");

  const data: Prisma.SupportTicketUpdateInput = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.priority ? { priority: input.priority } : {}),
    ...(input.assignedToUserId ? { assignedTo: { connect: { id: input.assignedToUserId } } } : {}),
    ...(input.status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
    ...(input.status === "REOPENED" ? { reopenedAt: new Date(), resolvedAt: null } : {})
  };

  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data,
    include: supportTicketInclude
  });

  if (input.internalNote?.trim()) {
    await addSupportMessage({
      ticketId,
      authorUserId: req.user?.id,
      authorRole: req.user?.role ?? "SUPPORT",
      visibility: "INTERNAL",
      message: input.internalNote.trim()
    });
  }
  if (input.customerReply?.trim()) {
    await addSupportMessage({
      ticketId,
      authorUserId: req.user?.id,
      authorRole: req.user?.role ?? "SUPPORT",
      visibility: "CUSTOMER",
      message: input.customerReply.trim()
    });
    await prisma.notification.create({
      data: {
        audience: "customer",
        type: "system",
        title: `Support update ${ticket.ticketNumber}`,
        body: input.customerReply.trim()
      }
    });
  }
  if (input.sellerReply?.trim()) {
    await addSupportMessage({
      ticketId,
      authorUserId: req.user?.id,
      authorRole: req.user?.role ?? "SUPPORT",
      visibility: "SELLER",
      message: input.sellerReply.trim()
    });
    await prisma.notification.create({
      data: {
        audience: "seller",
        type: "system",
        title: `Support update ${ticket.ticketNumber}`,
        body: input.sellerReply.trim()
      }
    });
  }

  await writeAuditLog(req, {
    action: "support_ticket_updated",
    entityType: "SupportTicket",
    entityId: ticket.id,
    metadata: input as Prisma.InputJsonValue
  });

  const updated = await prisma.supportTicket.findUniqueOrThrow({
    where: { id: ticketId },
    include: supportTicketInclude
  });
  return sendOk(res, updated);
}));

opsRouter.post("/support-tickets/:ticketId/messages", asyncHandler(async (req, res) => {
  const ticketId = getParam(req, "ticketId");
  const input = z.object({
    message: z.string().min(2),
    visibility: z.enum(["INTERNAL", "CUSTOMER", "SELLER", "BOTH"]).default("INTERNAL")
  }).parse(req.body);

  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new ApiError(404, "Support ticket not found.", "SUPPORT_TICKET_NOT_FOUND");

  const message = await addSupportMessage({
    ticketId,
    authorUserId: req.user?.id,
    authorRole: req.user?.role ?? "SUPPORT",
    visibility: input.visibility,
    message: input.message
  });

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() }
  });
  await writeAuditLog(req, {
    action: "support_message_added",
    entityType: "SupportTicket",
    entityId: ticket.id,
    metadata: input
  });
  return sendOk(res, message, 201);
}));

opsRouter.get("/seller-verification", asyncHandler(async (_req, res) => {
  const sellers = await prisma.sellerProfile.findMany({
    include: { user: true, locations: true, documents: true, products: true },
    orderBy: { updatedAt: "desc" }
  });

  return sendOk(res, sellers.map((seller) => {
    const pendingDocs = seller.documents.filter((document) => document.status === "PENDING").length;
    const rejectedDocs = seller.documents.filter((document) => document.status === "REJECTED").length;
    return {
      ...seller,
      opsState: rejectedDocs > 0 ? "ACTION_REQUIRED" : pendingDocs > 0 ? "PENDING_DOC_REVIEW" : seller.storeLive ? "LIVE" : "READY_TO_ENABLE",
      pendingDocs,
      rejectedDocs,
      liveProducts: seller.products.filter((product) => product.active).length
    };
  }));
}));

opsRouter.patch("/documents/:documentId", asyncHandler(async (req, res) => {
  const documentId = getParam(req, "documentId");
  const input = z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    reason: z.string().optional()
  }).superRefine((value, ctx) => {
    if (value.status === "REJECTED" && !value.reason?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reason"], message: "Reject reason is required." });
    }
  }).parse(req.body);

  const document = await prisma.complianceDocument.update({
    where: { id: documentId },
    data: { status: input.status, reason: input.reason }
  });
  await writeAuditLog(req, {
    action: input.status === "APPROVED" ? "document_approved" : "document_rejected",
    entityType: "ComplianceDocument",
    entityId: document.id,
    metadata: input
  });
  return sendOk(res, document);
}));

opsRouter.patch("/sellers/:sellerId/live", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const input = z.object({
    storeLive: z.boolean(),
    reason: z.string().optional()
  }).parse(req.body);

  const seller = await prisma.sellerProfile.update({
    where: { id: sellerId },
    data: { storeLive: input.storeLive }
  });

  await prisma.notification.create({
    data: {
      audience: "seller",
      type: "system",
      title: input.storeLive ? "Store enabled" : "Store disabled",
      body: input.reason?.trim() || (input.storeLive ? "Your store is now live on Bazaar Setu." : "Your store is temporarily disabled by Ops.")
    }
  });

  await writeAuditLog(req, {
    action: input.storeLive ? "seller_store_enabled" : "seller_store_disabled",
    entityType: "SellerProfile",
    entityId: seller.id,
    metadata: input
  });

  return sendOk(res, seller);
}));

opsRouter.get("/catalogue-requests", asyncHandler(async (_req, res) => {
  const requests = await prisma.productApprovalRequest.findMany({
    include: { seller: true, product: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });
  return sendOk(res, requests);
}));

opsRouter.patch("/catalogue-requests/:requestId", asyncHandler(async (req, res) => {
  const requestId = getParam(req, "requestId");
  const input = z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    reason: z.string().optional()
  }).superRefine((value, ctx) => {
    if (value.status === "REJECTED" && !value.reason?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reason"], message: "Reject reason is required." });
    }
  }).parse(req.body);

  if (input.status === "APPROVED") {
    const approved = await approveProductRequest(requestId, input.reason);
    await writeAuditLog(req, {
      action: "catalogue_request_approved",
      entityType: "ProductApprovalRequest",
      entityId: approved.id,
      metadata: input
    });
    return sendOk(res, approved);
  }

  const request = await rejectProductRequest(requestId, input.reason?.trim() ?? "");
  await writeAuditLog(req, {
    action: "catalogue_request_rejected",
    entityType: "ProductApprovalRequest",
    entityId: request.id,
    metadata: input
  });
  return sendOk(res, request);
}));
