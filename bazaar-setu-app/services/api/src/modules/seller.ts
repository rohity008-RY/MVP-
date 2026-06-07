import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";

export const sellerRouter = Router();

sellerRouter.get("/:sellerId/profile", async (req, res) => {
  const seller = await prisma.sellerProfile.findUnique({
    where: { id: req.params.sellerId },
    include: { locations: true, documents: true }
  });
  res.json({ ok: true, data: seller });
});

sellerRouter.put("/:sellerId/profile", async (req, res) => {
  const input = z.object({
    ownerName: z.string().optional(),
    shopName: z.string().optional(),
    storeLive: z.boolean().optional(),
    selectedCategoryIds: z.array(z.string()).optional(),
    defaultSlaValue: z.number().int().positive().optional(),
    defaultSlaUnit: z.string().optional(),
    autoInvoiceEnabled: z.boolean().optional(),
    deliveryFee: z.number().int().min(0).optional()
  }).parse(req.body);

  const seller = await prisma.sellerProfile.update({
    where: { id: req.params.sellerId },
    data: input
  });
  res.json({ ok: true, data: seller });
});

sellerRouter.get("/:sellerId/catalogue", async (req, res) => {
  const seller = await prisma.sellerProfile.findUnique({ where: { id: req.params.sellerId } });
  const products = await prisma.productMaster.findMany({
    where: { active: true, categoryId: { in: seller?.selectedCategoryIds ?? [] } },
    include: { category: true }
  });
  res.json({ ok: true, data: products });
});

sellerRouter.get("/:sellerId/products", async (req, res) => {
  const products = await prisma.sellerProduct.findMany({
    where: { sellerId: req.params.sellerId },
    include: { product: true }
  });
  res.json({ ok: true, data: products });
});

sellerRouter.post("/:sellerId/products", async (req, res) => {
  const input = z.object({
    productId: z.string(),
    price: z.number().int().positive(),
    qty: z.number().int().nonnegative(),
    active: z.boolean().default(true),
    tags: z.array(z.string()).default(["Quick Delivery"])
  }).parse(req.body);
  const product = await prisma.sellerProduct.create({ data: { ...input, sellerId: req.params.sellerId } });
  res.json({ ok: true, data: product });
});

sellerRouter.patch("/:sellerId/products/:sellerProductId", async (req, res) => {
  const input = z.object({
    price: z.number().int().positive().optional(),
    qty: z.number().int().nonnegative().optional(),
    active: z.boolean().optional(),
    tags: z.array(z.string()).optional()
  }).parse(req.body);
  const product = await prisma.sellerProduct.update({
    where: { id: req.params.sellerProductId },
    data: input
  });
  res.json({ ok: true, data: product });
});

sellerRouter.get("/:sellerId/orders", async (req, res) => {
  const orders = await prisma.sellerSubOrder.findMany({
    where: { sellerId: req.params.sellerId },
    include: { parentOrder: true, items: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ ok: true, data: orders });
});

sellerRouter.patch("/:sellerId/orders/:subOrderId", async (req, res) => {
  const input = z.object({
    action: z.enum(["confirm", "reject", "addInvoice", "handover", "delivered"]),
    invoiceNumber: z.string().optional(),
    reason: z.string().optional()
  }).parse(req.body);

  const seller = await prisma.sellerProfile.findUnique({ where: { id: req.params.sellerId } });
  const current = await prisma.sellerSubOrder.findUnique({ where: { id: req.params.subOrderId } });
  if (!seller || !current) return res.status(404).json({ ok: false, error: "Order not found" });

  const timeline = Array.isArray(current.timeline) ? current.timeline : [];
  const update: Record<string, unknown> = {};

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

  const order = await prisma.sellerSubOrder.update({ where: { id: req.params.subOrderId }, data: update });
  res.json({ ok: true, data: order });
});

sellerRouter.post("/:sellerId/product-requests", async (req, res) => {
  const input = z.object({
    categoryId: z.string(),
    name: z.string(),
    unit: z.string(),
    hsn: z.string().optional(),
    imageUrl: z.string().optional(),
    aiExtractedFields: z.record(z.string()).optional()
  }).parse(req.body);
  const request = await prisma.productApprovalRequest.create({ data: { ...input, sellerId: req.params.sellerId } });
  res.json({ ok: true, data: request });
});
