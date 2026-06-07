import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";

export const adminRouter = Router();

const defaultSettings = {
  paymentConfig: {
    vendors: [
      { id: "razorpay-upi", label: "UPI via Razorpay", enabled: true },
      { id: "razorpay-cards", label: "Cards via Razorpay", enabled: true },
      { id: "wallet", label: "Bazaar Setu Wallet", enabled: false },
      { id: "cod", label: "Cash on Delivery", enabled: true }
    ]
  },
  rewardConfig: { enabled: true, pointsPerHundred: 1 }
};

adminRouter.get("/dashboard", async (_req, res) => {
  const [orders, sellers, productRequests, notifications] = await Promise.all([
    prisma.parentOrder.count(),
    prisma.sellerProfile.count(),
    prisma.productApprovalRequest.count({ where: { status: "PENDING" } }),
    prisma.notification.count()
  ]);
  res.json({ ok: true, data: { orders, sellers, productRequests, notifications } });
});

adminRouter.get("/orders", async (_req, res) => {
  const orders = await prisma.parentOrder.findMany({
    include: { subOrders: { include: { seller: true, items: true } }, address: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ ok: true, data: orders });
});

adminRouter.get("/sellers", async (_req, res) => {
  const sellers = await prisma.sellerProfile.findMany({
    include: { user: true, locations: true, documents: true, products: true }
  });
  res.json({ ok: true, data: sellers });
});

adminRouter.get("/seller-leads", async (_req, res) => {
  const leads = await prisma.sellerLead.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ ok: true, data: leads });
});

adminRouter.patch("/seller-leads/:leadId", async (req, res) => {
  const input = z.object({
    status: z.enum(["NEW", "CONTACTED", "ONBOARDED", "REJECTED"]),
    notes: z.string().optional()
  }).parse(req.body);
  const lead = await prisma.sellerLead.update({ where: { id: req.params.leadId }, data: input });
  res.json({ ok: true, data: lead });
});

adminRouter.get("/product-requests", async (_req, res) => {
  const requests = await prisma.productApprovalRequest.findMany({
    include: { seller: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ ok: true, data: requests });
});

adminRouter.patch("/product-requests/:requestId", async (req, res) => {
  const input = z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    reason: z.string().optional()
  }).parse(req.body);

  const request = await prisma.productApprovalRequest.update({
    where: { id: req.params.requestId },
    data: { status: input.status, reason: input.reason }
  });

  if (input.status === "APPROVED") {
    const productId = request.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.productMaster.upsert({
      where: { id: productId },
      update: {},
      create: {
        id: productId,
        categoryId: request.categoryId,
        name: request.name,
        unit: request.unit,
        hsn: request.hsn,
        aliases: [request.name.toLowerCase()],
        fssaiApplicable: true,
        legalMetrology: { netQuantity: request.unit, countryOfOrigin: "India" }
      }
    });
  }

  res.json({ ok: true, data: request });
});

adminRouter.get("/notifications", async (_req, res) => {
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ ok: true, data: notifications });
});

adminRouter.post("/notifications", async (req, res) => {
  const input = z.object({
    audience: z.enum(["customer", "seller", "admin", "all"]),
    type: z.enum(["offer", "order", "system", "approval", "refund"]),
    title: z.string(),
    body: z.string()
  }).parse(req.body);
  const notification = await prisma.notification.create({ data: input });
  res.json({ ok: true, data: notification });
});

adminRouter.get("/settings", async (_req, res) => {
  const settings = await prisma.platformSetting.findMany();
  const data = {
    ...defaultSettings,
    ...Object.fromEntries(settings.map((setting) => [setting.key, setting.value]))
  };
  res.json({ ok: true, data });
});

adminRouter.patch("/settings", async (req, res) => {
  const input = z.object({
    paymentConfig: z.unknown().optional(),
    rewardConfig: z.unknown().optional()
  }).parse(req.body);

  await Promise.all(
    Object.entries(input).map(([key, value]) => {
      const jsonValue = value as Prisma.InputJsonValue;
      return (
      prisma.platformSetting.upsert({
        where: { key },
        update: { value: jsonValue },
        create: { key, value: jsonValue }
      })
      );
    })
  );

  const settings = await prisma.platformSetting.findMany();
  const data = {
    ...defaultSettings,
    ...Object.fromEntries(settings.map((setting) => [setting.key, setting.value]))
  };
  res.json({ ok: true, data });
});
