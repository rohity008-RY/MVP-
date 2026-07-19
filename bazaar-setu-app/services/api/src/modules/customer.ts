import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { catalogueImagePath } from "../catalogue-images.js";
import { prisma } from "../db.js";
import { ApiError, asyncHandler, getParam, sendOk } from "../http.js";
import { requireCustomerAccess, requireRole } from "../middleware.js";
import { getPaymentConfig, getRewardConfig, isCodPaymentMethod, postCheckoutRewards, resolveEnabledPaymentMethod } from "../platform-config.js";
import { addSupportMessage, createSupportTicket, filterTicketMessages, supportTicketInclude } from "../support-service.js";

export const customerRouter = Router();

function addSlaToDate(value: number, unit: string) {
  const minutes = unit === "days" ? value * 24 * 60 : unit === "hours" ? value * 60 : value;
  return new Date(Date.now() + minutes * 60_000);
}

customerRouter.get("/home", asyncHandler(async (_req, res) => {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.productMaster.findMany({
      where: { active: true, sellerProducts: { some: { active: true, qty: { gt: 0 }, seller: { storeLive: true } } } },
      include: {
        category: true,
        sellerProducts: {
          where: { active: true, qty: { gt: 0 }, seller: { storeLive: true } },
          include: { seller: true },
          take: 1
        }
      },
      take: 24
    })
  ]);
  return sendOk(res, {
    categories: categories.map((category) => ({
      ...category,
      imageUrl: catalogueImagePath("categories", category.id)
    })),
    products: products.map((product) => ({
      ...product,
      imageUrl: product.imageUrl || catalogueImagePath("products", product.id)
    }))
  });
}));

customerRouter.get("/config", asyncHandler(async (_req, res) => {
  const [paymentConfig, rewardConfig] = await Promise.all([getPaymentConfig(), getRewardConfig()]);
  return sendOk(res, { paymentConfig, rewardConfig });
}));

customerRouter.use("/:customerId", requireRole("CUSTOMER", "ADMIN", "SUPPORT"), requireCustomerAccess("customerId"));

customerRouter.get("/:customerId/addresses", asyncHandler(async (req, res) => {
  const customerId = getParam(req, "customerId");
  const addresses = await prisma.customerAddress.findMany({ where: { customerId } });
  return sendOk(res, addresses);
}));

customerRouter.post("/:customerId/addresses", asyncHandler(async (req, res) => {
  const customerId = getParam(req, "customerId");
  const input = z.object({
    type: z.enum(["home", "office", "other"]).default("other"),
    label: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    lat: z.number(),
    lng: z.number()
  }).parse(req.body);

  const count = await prisma.customerAddress.count({ where: { customerId } });
  if (count >= 5) throw new ApiError(400, "Maximum 5 addresses allowed.", "ADDRESS_LIMIT_REACHED");

  const address = await prisma.customerAddress.create({
    data: { ...input, customer: { connect: { id: customerId } } }
  });
  return sendOk(res, address, 201);
}));

customerRouter.put("/:customerId/addresses/:addressId", asyncHandler(async (req, res) => {
  const customerId = getParam(req, "customerId");
  const addressId = getParam(req, "addressId");
  const input = z.object({
    type: z.enum(["home", "office", "other"]).optional(),
    label: z.string().optional(),
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional()
  }).parse(req.body);

  const existing = await prisma.customerAddress.findFirst({
    where: { id: addressId, customerId }
  });
  if (!existing) throw new ApiError(404, "Address not found.", "ADDRESS_NOT_FOUND");

  const address = await prisma.customerAddress.update({
    where: { id: addressId },
    data: input
  });
  return sendOk(res, address);
}));

customerRouter.delete("/:customerId/addresses/:addressId", asyncHandler(async (req, res) => {
  const customerId = getParam(req, "customerId");
  const addressId = getParam(req, "addressId");
  const existing = await prisma.customerAddress.findFirst({
    where: { id: addressId, customerId }
  });
  if (!existing) throw new ApiError(404, "Address not found.", "ADDRESS_NOT_FOUND");

  await prisma.customerAddress.delete({ where: { id: addressId } });
  return sendOk(res, { id: addressId });
}));

customerRouter.post("/:customerId/seller-leads", asyncHandler(async (req, res) => {
  const customerId = getParam(req, "customerId");
  const input = z.object({
    name: z.string(),
    phone: z.string(),
    notes: z.string().optional()
  }).parse(req.body);
  const lead = await prisma.sellerLead.create({
    data: { ...input, customer: { connect: { id: customerId } } }
  });
  return sendOk(res, lead, 201);
}));

customerRouter.get("/:customerId/support-tickets", asyncHandler(async (req, res) => {
  const customerId = getParam(req, "customerId");
  const query = z.object({
    status: z.enum(["NEW", "ASSIGNED", "WAITING_CUSTOMER", "WAITING_SELLER", "WAITING_DELIVERY", "REFUND_REVIEW", "RESOLVED", "REOPENED"]).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50)
  }).parse(req.query);

  const tickets = await prisma.supportTicket.findMany({
    where: {
      customerId,
      ...(query.status ? { status: query.status } : {})
    },
    include: supportTicketInclude,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: query.limit
  });

  return sendOk(res, tickets.map((ticket) => filterTicketMessages(ticket, "customer")));
}));

customerRouter.post("/:customerId/support-tickets", asyncHandler(async (req, res) => {
  const customerId = getParam(req, "customerId");
  const input = z.object({
    category: z.string().min(2),
    subCategory: z.string().optional(),
    subject: z.string().min(3),
    description: z.string().min(5),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
    parentOrderId: z.string().optional(),
    subOrderId: z.string().optional(),
    preferredContact: z.enum(["chat", "call", "whatsapp"]).default("chat"),
    attachments: z.array(z.object({ name: z.string(), url: z.string() })).optional()
  }).parse(req.body);

  let sellerId: string | undefined;
  let parentOrderId = input.parentOrderId;
  if (input.subOrderId) {
    const subOrder = await prisma.sellerSubOrder.findFirst({
      where: { id: input.subOrderId, parentOrder: { customerId } }
    });
    if (!subOrder) throw new ApiError(404, "Sub-order not found for this customer.", "SUB_ORDER_NOT_FOUND");
    sellerId = subOrder.sellerId;
    parentOrderId = subOrder.parentOrderId;
  } else if (parentOrderId) {
    const parentOrder = await prisma.parentOrder.findFirst({
      where: { id: parentOrderId, customerId }
    });
    if (!parentOrder) throw new ApiError(404, "Order not found for this customer.", "ORDER_NOT_FOUND");
  }

  const ticket = await createSupportTicket({
    source: "CUSTOMER",
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
      title: `New customer support ticket ${ticket.ticketNumber}`,
      body: `${ticket.subject} · ${ticket.priority}`
    }
  });

  return sendOk(res, filterTicketMessages(ticket, "customer"), 201);
}));

customerRouter.post("/:customerId/support-tickets/:ticketId/messages", asyncHandler(async (req, res) => {
  const customerId = getParam(req, "customerId");
  const ticketId = getParam(req, "ticketId");
  const input = z.object({
    message: z.string().min(2),
    attachments: z.array(z.object({ name: z.string(), url: z.string() })).optional()
  }).parse(req.body);

  const ticket = await prisma.supportTicket.findFirst({ where: { id: ticketId, customerId } });
  if (!ticket) throw new ApiError(404, "Support ticket not found.", "SUPPORT_TICKET_NOT_FOUND");

  await addSupportMessage({
    ticketId,
    authorUserId: req.user?.id,
    authorRole: "CUSTOMER",
    visibility: "CUSTOMER",
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
  return sendOk(res, filterTicketMessages(updated, "customer"));
}));

customerRouter.get("/:customerId/orders", asyncHandler(async (req, res) => {
  const customerId = getParam(req, "customerId");
  const orders = await prisma.parentOrder.findMany({
    where: { customerId },
    include: { subOrders: { include: { items: true, seller: true } } },
    orderBy: { createdAt: "desc" }
  });
  return sendOk(res, orders);
}));

customerRouter.post("/:customerId/orders", asyncHandler(async (req, res) => {
  const customerId = getParam(req, "customerId");
  const input = z.object({
    addressId: z.string(),
    paymentMethod: z.string(),
    items: z.array(z.object({ sellerProductId: z.string(), qty: z.number().int().positive() })).min(1)
  }).parse(req.body);
  const [paymentConfig, rewardConfig] = await Promise.all([getPaymentConfig(), getRewardConfig()]);
  const paymentMethod = resolveEnabledPaymentMethod(paymentConfig, input.paymentMethod);
  const paymentState = isCodPaymentMethod(paymentMethod.id) ? "COD" : "PENDING";

  const address = await prisma.customerAddress.findFirst({
    where: { id: input.addressId, customerId }
  });
  if (!address) throw new ApiError(400, "Selected delivery address is not available.", "INVALID_ADDRESS");

  const sellerProducts = await prisma.sellerProduct.findMany({
    where: { id: { in: input.items.map((item) => item.sellerProductId) }, active: true, seller: { storeLive: true } },
    include: { product: true, seller: true }
  });

  const bySeller = new Map<string, Array<{ sellerProduct: (typeof sellerProducts)[number]; qty: number }>>();
  let total = 0;
  let deliveryFee = 0;
  for (const cartItem of input.items) {
    const sellerProduct = sellerProducts.find((product) => product.id === cartItem.sellerProductId);
    if (!sellerProduct) throw new ApiError(400, `Unavailable product ${cartItem.sellerProductId}.`, "PRODUCT_UNAVAILABLE");
    if (sellerProduct.qty < cartItem.qty) {
      throw new ApiError(400, `${sellerProduct.product.name} has only ${sellerProduct.qty} units available.`, "INSUFFICIENT_STOCK");
    }
    total += sellerProduct.price * cartItem.qty;
    if (!bySeller.has(sellerProduct.sellerId)) deliveryFee += sellerProduct.seller.deliveryFee;
    bySeller.set(sellerProduct.sellerId, [...(bySeller.get(sellerProduct.sellerId) ?? []), { sellerProduct, qty: cartItem.qty }]);
  }

  const order = await prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      const stockUpdate = await tx.sellerProduct.updateMany({
        where: { id: item.sellerProductId, qty: { gte: item.qty } },
        data: { qty: { decrement: item.qty } }
      });
      if (stockUpdate.count !== 1) {
        throw new ApiError(409, "Product stock changed. Please refresh cart and try again.", "STOCK_CHANGED");
      }
    }

    const createdOrder = await tx.parentOrder.create({
      data: {
        customer: { connect: { id: customerId } },
        address: { connect: { id: input.addressId } },
        paymentMethod: paymentMethod.id,
        paymentState,
        total,
        deliveryFee,
        subOrders: {
          create: Array.from(bySeller.entries()).map(([sellerId, items]) => {
            const seller = items[0]?.sellerProduct.seller;
            return {
              seller: { connect: { id: sellerId } },
              paymentState,
              slaDueAt: seller ? addSlaToDate(seller.defaultSlaValue, seller.defaultSlaUnit) : undefined,
              timeline: [{ status: "placed", at: new Date().toISOString() }],
              items: {
                create: items.map(({ sellerProduct, qty }) => {
                  return {
                    productId: sellerProduct.productId,
                    sellerProduct: { connect: { id: sellerProduct.id } },
                    name: sellerProduct.product.name,
                    hsn: sellerProduct.product.hsn,
                    unit: sellerProduct.product.unit,
                    qty,
                    price: sellerProduct.price
                  };
                })
              }
            };
          })
        }
      },
      include: { subOrders: { include: { items: true } } }
    });

    await postCheckoutRewards(tx, {
      customerId,
      parentOrderId: createdOrder.id,
      orderTotal: total,
      rewardConfig
    });

    return createdOrder;
  });

  return sendOk(res, order, 201);
}));
