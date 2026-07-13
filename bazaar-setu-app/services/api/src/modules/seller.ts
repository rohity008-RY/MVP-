import type { Prisma } from "@prisma/client";
import { Router } from "express";
import PDFDocument from "pdfkit";
import { z } from "zod";
import { prisma } from "../db.js";
import { ApiError, asyncHandler, getParam, sendOk } from "../http.js";
import { requireRole, requireSellerAccess } from "../middleware.js";
import { addSupportMessage, createSupportTicket, createSystemTicketForSubOrder, filterTicketMessages, supportTicketInclude } from "../support-service.js";

export const sellerRouter = Router();
sellerRouter.use("/:sellerId", requireRole("SELLER", "ADMIN", "SUPPORT"), requireSellerAccess("sellerId"));

const documentFormatSchema = z.enum(["a4", "a5", "4x6", "80mm"]);
const documentTypeSchema = z.enum(["invoice", "label"]);

function pdfSize(format: z.infer<typeof documentFormatSchema>): [number, number] | string {
  if (format === "a5") return "A5";
  if (format === "4x6") return [288, 432];
  if (format === "80mm") return [226, 560];
  return "A4";
}

function money(value: number) {
  return `Rs. ${value.toFixed(2)}`;
}

function writePdfHeader(doc: PDFKit.PDFDocument, title: string) {
  doc.fontSize(18).fillColor("#ff4b2b").text("Bazaar Setu", { continued: false });
  doc.moveDown(0.2);
  doc.fontSize(13).fillColor("#0c0c12").text(title);
  doc.moveDown(0.8);
}

function writeKeyValue(doc: PDFKit.PDFDocument, label: string, value?: string | number | null) {
  doc.fontSize(8).fillColor("#6f6f84").text(label, { continued: true });
  doc.fillColor("#0c0c12").text(`  ${value ?? "-"}`);
}

sellerRouter.get("/:sellerId/profile", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerId },
    include: { locations: true, documents: true }
  });
  if (!seller) throw new ApiError(404, "Seller not found.", "SELLER_NOT_FOUND");
  return sendOk(res, seller);
}));

sellerRouter.put("/:sellerId/profile", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const input = z.object({
    ownerName: z.string().optional(),
    shopName: z.string().optional(),
    storeLive: z.boolean().optional(),
    selectedCategoryIds: z.array(z.string()).optional(),
    defaultSlaValue: z.number().int().positive().optional(),
    defaultSlaUnit: z.enum(["minutes", "hours", "days"]).optional(),
    autoInvoiceEnabled: z.boolean().optional(),
    deliveryFee: z.number().int().min(0).optional()
  }).parse(req.body);

  const seller = await prisma.sellerProfile.update({
    where: { id: sellerId },
    data: input
  });
  return sendOk(res, seller);
}));

sellerRouter.get("/:sellerId/catalogue", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const seller = await prisma.sellerProfile.findUnique({ where: { id: sellerId } });
  if (!seller) throw new ApiError(404, "Seller not found.", "SELLER_NOT_FOUND");
  const products = await prisma.productMaster.findMany({
    where: { active: true, categoryId: { in: seller?.selectedCategoryIds ?? [] } },
    include: { category: true }
  });
  return sendOk(res, products);
}));

sellerRouter.get("/:sellerId/products", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const products = await prisma.sellerProduct.findMany({
    where: { sellerId },
    include: { product: true }
  });
  return sendOk(res, products);
}));

sellerRouter.post("/:sellerId/products", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const input = z.object({
    productId: z.string(),
    price: z.number().int().positive(),
    qty: z.number().int().nonnegative(),
    active: z.boolean().default(true),
    tags: z.array(z.string()).default(["Quick Delivery"])
  }).parse(req.body);
  const [seller, masterProduct, existing] = await Promise.all([
    prisma.sellerProfile.findUnique({ where: { id: sellerId } }),
    prisma.productMaster.findUnique({ where: { id: input.productId } }),
    prisma.sellerProduct.findFirst({ where: { sellerId, productId: input.productId } })
  ]);
  if (!seller) throw new ApiError(404, "Seller not found.", "SELLER_NOT_FOUND");
  if (!masterProduct?.active) throw new ApiError(400, "Product is not active in master catalogue.", "CATALOGUE_PRODUCT_INACTIVE");
  if (seller.selectedCategoryIds.length > 0 && !seller.selectedCategoryIds.includes(masterProduct.categoryId)) {
    throw new ApiError(400, "Product category is not enabled for this seller.", "SELLER_CATEGORY_NOT_ENABLED");
  }

  const { productId, ...sellerProductInput } = input;
  const product = existing
    ? await prisma.sellerProduct.update({ where: { id: existing.id }, data: sellerProductInput })
    : await prisma.sellerProduct.create({
        data: {
          ...sellerProductInput,
          seller: { connect: { id: sellerId } },
          product: { connect: { id: productId } }
        }
      });
  return sendOk(res, product, existing ? 200 : 201);
}));

sellerRouter.patch("/:sellerId/products/:sellerProductId", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const sellerProductId = getParam(req, "sellerProductId");
  const input = z.object({
    price: z.number().int().positive().optional(),
    qty: z.number().int().nonnegative().optional(),
    active: z.boolean().optional(),
    tags: z.array(z.string()).optional()
  }).parse(req.body);
  const existing = await prisma.sellerProduct.findFirst({
    where: { id: sellerProductId, sellerId }
  });
  if (!existing) throw new ApiError(404, "Seller product not found.", "SELLER_PRODUCT_NOT_FOUND");

  const product = await prisma.sellerProduct.update({
    where: { id: sellerProductId },
    data: input
  });
  return sendOk(res, product);
}));

sellerRouter.get("/:sellerId/orders", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const orders = await prisma.sellerSubOrder.findMany({
    where: { sellerId },
    include: { parentOrder: true, items: true },
    orderBy: { createdAt: "desc" }
  });
  return sendOk(res, orders);
}));

sellerRouter.patch("/:sellerId/orders/:subOrderId", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const subOrderId = getParam(req, "subOrderId");
  const input = z
    .object({
      action: z.enum(["confirm", "reject", "addInvoice", "handover", "delivered"]),
      invoiceNumber: z.string().optional(),
      reason: z.string().optional()
    })
    .superRefine((value, ctx) => {
      if (value.action === "reject" && !value.reason?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reason"], message: "Reject reason is required." });
      }
      if (value.action === "addInvoice" && !value.invoiceNumber?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["invoiceNumber"], message: "Invoice number is required." });
      }
    })
    .parse(req.body);

  const seller = await prisma.sellerProfile.findUnique({ where: { id: sellerId } });
  const current = await prisma.sellerSubOrder.findFirst({ where: { id: subOrderId, sellerId } });
  if (!seller || !current) throw new ApiError(404, "Order not found.", "ORDER_NOT_FOUND");

  const timeline = Array.isArray(current.timeline) ? current.timeline : [];
  const update: Prisma.SellerSubOrderUpdateInput = {};

  if (input.action === "confirm") {
    update.status = seller.autoInvoiceEnabled ? "BAG_PACKED" : "INVOICE_REQUIRED";
    if (seller.autoInvoiceEnabled) {
      update.invoiceNumber = `BS-${Date.now().toString(36).toUpperCase()}`;
      update.invoiceMode = "auto";
    }
  }
  if (input.action === "reject") {
    update.status = "REJECTED";
    update.rejectReason = input.reason ?? "No reason added";
    update.paymentState = current.paymentState === "PAID" ? "REFUND_PENDING" : current.paymentState;
  }
  if (input.action === "addInvoice") {
    update.status = "BAG_PACKED";
    update.invoiceNumber = input.invoiceNumber;
    update.invoiceMode = "manual";
  }
  if (input.action === "handover") update.status = "HANDED_OVER";
  if (input.action === "delivered") update.status = "DELIVERED";

  update.timeline = [...timeline, { status: update.status, at: new Date().toISOString(), note: input.reason }];

  const order = await prisma.sellerSubOrder.update({ where: { id: subOrderId }, data: update });
  if (input.action === "reject" && order.paymentState === "REFUND_PENDING") {
    await createSystemTicketForSubOrder({
      subOrderId: order.id,
      category: "refund",
      subject: "Prepaid order rejected, refund review needed",
      description: input.reason ?? "Seller rejected a prepaid order. Ops needs to review refund and customer communication.",
      priority: "HIGH",
      status: "REFUND_REVIEW",
      metadata: { rejectReason: input.reason, sellerId }
    });
  }
  return sendOk(res, order);
}));

sellerRouter.get("/:sellerId/orders/:subOrderId/document", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const subOrderId = getParam(req, "subOrderId");
  const query = z.object({
    type: documentTypeSchema.default("invoice"),
    format: documentFormatSchema.default("a4")
  }).parse(req.query);

  const order = await prisma.sellerSubOrder.findFirst({
    where: { id: subOrderId, sellerId },
    include: {
      seller: { include: { user: true, locations: true, documents: true } },
      items: true,
      parentOrder: { include: { address: true, customer: { include: { user: true } } } }
    }
  });
  if (!order) throw new ApiError(404, "Order not found.", "ORDER_NOT_FOUND");
  if (query.type === "invoice" && !order.invoiceNumber) {
    throw new ApiError(400, "Invoice number is required before invoice PDF can be generated.", "INVOICE_REQUIRED");
  }

  const doc = new PDFDocument({ size: pdfSize(query.format), margin: query.format === "80mm" ? 16 : 32 });
  const filename = `${query.type}-${order.id}-${query.format}.pdf`;
  res.status(200);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  doc.pipe(res);

  const sellerLocation = order.seller.locations[0];
  const fssai = order.seller.documents.find((document) => document.type === "FSSAI")?.identifier;

  if (query.type === "label") {
    writePdfHeader(doc, `Shipping Label · ${query.format.toUpperCase()}`);
    writeKeyValue(doc, "Shipment", order.id);
    writeKeyValue(doc, "Parent order", order.parentOrderId);
    writeKeyValue(doc, "Seller", order.seller.shopName);
    writeKeyValue(doc, "Pickup", sellerLocation ? `${sellerLocation.address}, ${sellerLocation.city} ${sellerLocation.pincode}` : "Seller location");
    doc.moveDown(0.7);
    doc.fontSize(10).fillColor("#0c0c12").text("Deliver to", { underline: true });
    doc.fontSize(12).text(order.parentOrder.customer.user.name);
    doc.fontSize(9).text(order.parentOrder.customer.user.phone);
    doc.text(`${order.parentOrder.address.line1}${order.parentOrder.address.line2 ? `, ${order.parentOrder.address.line2}` : ""}`);
    doc.text(`${order.parentOrder.address.city}, ${order.parentOrder.address.state} ${order.parentOrder.address.pincode}`);
    doc.text(`Lat/Lng: ${order.parentOrder.address.lat}, ${order.parentOrder.address.lng}`);
    doc.moveDown(0.7);
    writeKeyValue(doc, "Invoice", order.invoiceNumber ?? "Pending");
    writeKeyValue(doc, "Payment", order.paymentState);
    writeKeyValue(doc, "Support", "support@bazaarsetu.local");
    doc.moveDown(0.8);
    doc.fontSize(9).text("Items");
    order.items.forEach((item) => doc.fontSize(8).text(`• ${item.name} x ${item.qty} (${item.unit})`));
    doc.end();
    return;
  }

  writePdfHeader(doc, `Tax Invoice · ${query.format.toUpperCase()}`);
  writeKeyValue(doc, "Invoice no.", order.invoiceNumber);
  writeKeyValue(doc, "Invoice date", new Date().toLocaleString("en-IN"));
  writeKeyValue(doc, "Shipment", order.id);
  writeKeyValue(doc, "Order", order.parentOrderId);
  doc.moveDown(0.6);
  doc.fontSize(10).fillColor("#0c0c12").text("Seller");
  writeKeyValue(doc, "Shop", order.seller.shopName);
  writeKeyValue(doc, "Owner", order.seller.ownerName);
  writeKeyValue(doc, "Phone", order.seller.user.phone);
  writeKeyValue(doc, "FSSAI", fssai ?? "N/A");
  writeKeyValue(doc, "Pickup", sellerLocation ? `${sellerLocation.address}, ${sellerLocation.city} ${sellerLocation.pincode}` : "N/A");
  doc.moveDown(0.6);
  doc.fontSize(10).fillColor("#0c0c12").text("Customer");
  writeKeyValue(doc, "Name", order.parentOrder.customer.user.name);
  writeKeyValue(doc, "Phone", order.parentOrder.customer.user.phone);
  writeKeyValue(doc, "Address", `${order.parentOrder.address.line1}, ${order.parentOrder.address.city} ${order.parentOrder.address.pincode}`);
  doc.moveDown(0.8);

  const startX = doc.x;
  const startY = doc.y;
  doc.fontSize(8).fillColor("#0c0c12").text("Item", startX, startY, { width: 160 });
  doc.text("HSN", startX + 165, startY, { width: 45 });
  doc.text("Qty", startX + 215, startY, { width: 35 });
  doc.text("Rate", startX + 252, startY, { width: 55 });
  doc.text("Total", startX + 310, startY, { width: 65 });
  doc.moveTo(startX, startY + 14).lineTo(startX + 375, startY + 14).strokeColor("#dedbd4").stroke();

  let y = startY + 22;
  let total = 0;
  order.items.forEach((item) => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    doc.fontSize(8).fillColor("#0c0c12").text(item.name, startX, y, { width: 160 });
    doc.text(item.hsn ?? "-", startX + 165, y, { width: 45 });
    doc.text(`${item.qty} ${item.unit}`, startX + 215, y, { width: 35 });
    doc.text(money(item.price), startX + 252, y, { width: 55 });
    doc.text(money(lineTotal), startX + 310, y, { width: 65 });
    y += 22;
  });
  doc.moveTo(startX, y).lineTo(startX + 375, y).strokeColor("#dedbd4").stroke();
  doc.moveDown(1.2);
  doc.fontSize(11).fillColor("#0c0c12").text(`Invoice total: ${money(total)}`, { align: "right" });
  doc.moveDown(0.8);
  doc.fontSize(7).fillColor("#6f6f84").text("Legal Metrology, HSN/GST, MRP/net quantity/origin/expiry and consumer-care fields must be validated before production use.");
  doc.text("Bazaar Setu support: support@bazaarsetu.local");
  doc.end();
}));

sellerRouter.post("/:sellerId/product-requests", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const input = z.object({
    categoryId: z.string(),
    name: z.string(),
    unit: z.string(),
    hsn: z.string().optional(),
    imageUrl: z.string().optional(),
    aiExtractedFields: z.record(z.string()).optional()
  }).parse(req.body);
  const seller = await prisma.sellerProfile.findUnique({ where: { id: sellerId } });
  if (!seller) throw new ApiError(404, "Seller not found.", "SELLER_NOT_FOUND");

  const request = await prisma.productApprovalRequest.create({
    data: {
      ...input,
      seller: { connect: { id: sellerId } }
    }
  });
  return sendOk(res, request, 201);
}));

sellerRouter.get("/:sellerId/support-tickets", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const query = z.object({
    status: z.enum(["NEW", "ASSIGNED", "WAITING_CUSTOMER", "WAITING_SELLER", "WAITING_DELIVERY", "REFUND_REVIEW", "RESOLVED", "REOPENED"]).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50)
  }).parse(req.query);

  const tickets = await prisma.supportTicket.findMany({
    where: {
      sellerId,
      ...(query.status ? { status: query.status } : {})
    },
    include: supportTicketInclude,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: query.limit
  });

  return sendOk(res, tickets.map((ticket) => filterTicketMessages(ticket, "seller")));
}));

sellerRouter.post("/:sellerId/support-tickets", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const input = z.object({
    category: z.string().min(2),
    subCategory: z.string().optional(),
    subject: z.string().min(3),
    description: z.string().min(5),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
    subOrderId: z.string().optional(),
    preferredContact: z.enum(["chat", "call", "whatsapp"]).default("chat"),
    attachments: z.array(z.object({ name: z.string(), url: z.string() })).optional()
  }).parse(req.body);

  let customerId: string | undefined;
  let parentOrderId: string | undefined;
  if (input.subOrderId) {
    const subOrder = await prisma.sellerSubOrder.findFirst({
      where: { id: input.subOrderId, sellerId },
      include: { parentOrder: true }
    });
    if (!subOrder) throw new ApiError(404, "Sub-order not found for this seller.", "SUB_ORDER_NOT_FOUND");
    customerId = subOrder.parentOrder.customerId;
    parentOrderId = subOrder.parentOrderId;
  }

  const ticket = await createSupportTicket({
    source: "SELLER",
    category: input.category,
    subCategory: input.subCategory,
    subject: input.subject,
    description: input.description,
    priority: input.priority,
    customerId,
    sellerId,
    parentOrderId,
    subOrderId: input.subOrderId,
    createdByUserId: req.user?.id,
    metadata: {
      preferredContact: input.preferredContact,
      attachments: input.attachments ?? []
    }
  });

  await prisma.notification.create({
    data: {
      audience: "admin",
      type: "system",
      title: `New seller support ticket ${ticket.ticketNumber}`,
      body: `${ticket.subject} · ${ticket.priority}`
    }
  });

  return sendOk(res, filterTicketMessages(ticket, "seller"), 201);
}));

sellerRouter.post("/:sellerId/support-tickets/:ticketId/messages", asyncHandler(async (req, res) => {
  const sellerId = getParam(req, "sellerId");
  const ticketId = getParam(req, "ticketId");
  const input = z.object({
    message: z.string().min(2),
    attachments: z.array(z.object({ name: z.string(), url: z.string() })).optional()
  }).parse(req.body);

  const ticket = await prisma.supportTicket.findFirst({ where: { id: ticketId, sellerId } });
  if (!ticket) throw new ApiError(404, "Support ticket not found.", "SUPPORT_TICKET_NOT_FOUND");

  await addSupportMessage({
    ticketId,
    authorUserId: req.user?.id,
    authorRole: "SELLER",
    visibility: "SELLER",
    message: input.message,
    attachments: input.attachments as Prisma.InputJsonValue | undefined
  });

  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: ticket.status === "RESOLVED" ? "REOPENED" : "ASSIGNED",
      reopenedAt: ticket.status === "RESOLVED" ? new Date() : ticket.reopenedAt
    },
    include: supportTicketInclude
  });
  return sendOk(res, filterTicketMessages(updated, "seller"));
}));
