import type { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { ApiError, asyncHandler, getParam, sendOk } from "../http.js";
import { requireRole, requireSellerAccess } from "../middleware.js";

export const sellerRouter = Router();
sellerRouter.use("/:sellerId", requireRole("SELLER", "ADMIN", "SUPPORT"), requireSellerAccess("sellerId"));

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
  return sendOk(res, order);
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
