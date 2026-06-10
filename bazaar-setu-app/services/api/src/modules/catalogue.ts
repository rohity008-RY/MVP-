import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler, sendOk } from "../http.js";

export const catalogueRouter = Router();

catalogueRouter.get("/categories", asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return sendOk(res, categories);
}));

catalogueRouter.get("/products", asyncHandler(async (req, res) => {
  const query = z.object({
    q: z.string().optional(),
    categoryId: z.string().optional()
  }).parse(req.query);

  const products = await prisma.productMaster.findMany({
    where: {
      active: true,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { brand: { contains: query.q, mode: "insensitive" } },
              { hsn: { contains: query.q, mode: "insensitive" } },
              { aliases: { has: query.q.toLowerCase() } }
            ]
          }
        : {})
    },
    include: {
      category: true,
      sellerProducts: {
        where: { active: true, qty: { gt: 0 }, seller: { storeLive: true } },
        include: { seller: true },
        take: 1
      }
    },
    take: 60
  });

  return sendOk(res, products);
}));
