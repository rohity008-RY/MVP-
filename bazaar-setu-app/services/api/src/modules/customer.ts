import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";

export const customerRouter = Router();

customerRouter.get("/home", async (_req, res) => {
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
  res.json({ ok: true, data: { categories, products } });
});

customerRouter.get("/:customerId/addresses", async (req, res) => {
  const addresses = await prisma.customerAddress.findMany({ where: { customerId: req.params.customerId } });
  res.json({ ok: true, data: addresses });
});

customerRouter.post("/:customerId/addresses", async (req, res) => {
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

  const count = await prisma.customerAddress.count({ where: { customerId: req.params.customerId } });
  if (count >= 5) return res.status(400).json({ ok: false, error: "Maximum 5 addresses allowed" });

  const address = await prisma.customerAddress.create({ data: { ...input, customerId: req.params.customerId } });
  res.json({ ok: true, data: address });
});

customerRouter.put("/:customerId/addresses/:addressId", async (req, res) => {
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

  const address = await prisma.customerAddress.update({
    where: { id: req.params.addressId },
    data: input
  });
  res.json({ ok: true, data: address });
});

customerRouter.delete("/:customerId/addresses/:addressId", async (req, res) => {
  await prisma.customerAddress.delete({ where: { id: req.params.addressId } });
  res.json({ ok: true, data: { id: req.params.addressId } });
});

customerRouter.post("/:customerId/seller-leads", async (req, res) => {
  const input = z.object({
    name: z.string(),
    phone: z.string(),
    notes: z.string().optional()
  }).parse(req.body);
  const lead = await prisma.sellerLead.create({ data: { ...input, customerId: req.params.customerId } });
  res.json({ ok: true, data: lead });
});

customerRouter.get("/:customerId/orders", async (req, res) => {
  const orders = await prisma.parentOrder.findMany({
    where: { customerId: req.params.customerId },
    include: { subOrders: { include: { items: true, seller: true } } },
    orderBy: { createdAt: "desc" }
  });
  res.json({ ok: true, data: orders });
});

customerRouter.post("/:customerId/orders", async (req, res) => {
  const input = z.object({
    addressId: z.string(),
    paymentMethod: z.string(),
    items: z.array(z.object({ sellerProductId: z.string(), qty: z.number().int().positive() })).min(1)
  }).parse(req.body);

  const sellerProducts = await prisma.sellerProduct.findMany({
    where: { id: { in: input.items.map((item) => item.sellerProductId) }, active: true },
    include: { product: true, seller: true }
  });

  const bySeller = new Map<string, typeof sellerProducts>();
  let total = 0;
  for (const cartItem of input.items) {
    const sellerProduct = sellerProducts.find((product) => product.id === cartItem.sellerProductId);
    if (!sellerProduct) return res.status(400).json({ ok: false, error: `Unavailable product ${cartItem.sellerProductId}` });
    total += sellerProduct.price * cartItem.qty;
    bySeller.set(sellerProduct.sellerId, [...(bySeller.get(sellerProduct.sellerId) ?? []), sellerProduct]);
  }

  const order = await prisma.parentOrder.create({
    data: {
      customerId: req.params.customerId,
      addressId: input.addressId,
      paymentMethod: input.paymentMethod,
      paymentState: input.paymentMethod === "cod" ? "COD" : "PENDING",
      total,
      subOrders: {
        create: Array.from(bySeller.entries()).map(([sellerId, products]) => ({
          sellerId,
          paymentState: input.paymentMethod === "cod" ? "COD" : "PENDING",
          timeline: [{ status: "placed", at: new Date().toISOString() }],
          items: {
            create: products.map((sellerProduct) => {
              const qty = input.items.find((item) => item.sellerProductId === sellerProduct.id)?.qty ?? 1;
              return {
                productId: sellerProduct.productId,
                sellerProductId: sellerProduct.id,
                name: sellerProduct.product.name,
                hsn: sellerProduct.product.hsn,
                unit: sellerProduct.product.unit,
                qty,
                price: sellerProduct.price
              };
            })
          }
        }))
      }
    },
    include: { subOrders: { include: { items: true } } }
  });

  res.json({ ok: true, data: order });
});
