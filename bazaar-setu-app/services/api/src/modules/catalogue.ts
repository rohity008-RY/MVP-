import { Router, type Response } from "express";
import { z } from "zod";
import { catalogueImagePath, renderCategoryImage, renderProductImage } from "../catalogue-images.js";
import { prisma } from "../db.js";
import { ApiError, asyncHandler, getParam, sendOk } from "../http.js";

export const catalogueRouter = Router();

function sendSvg(res: Response, svg: string) {
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  return res.status(200).send(svg);
}

catalogueRouter.get("/categories", asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return sendOk(res, categories.map((category) => ({
    ...category,
    imageUrl: catalogueImagePath("categories", category.id)
  })));
}));

catalogueRouter.get("/images/categories/:categoryId.svg", asyncHandler(async (req, res) => {
  const categoryId = getParam(req, "categoryId");
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new ApiError(404, "Category image not found.", "CATEGORY_IMAGE_NOT_FOUND");
  return sendSvg(res, renderCategoryImage(category));
}));

catalogueRouter.get("/images/products/:productId.svg", asyncHandler(async (req, res) => {
  const productId = getParam(req, "productId");
  const product = await prisma.productMaster.findUnique({
    where: { id: productId },
    include: { category: true }
  });
  if (!product) throw new ApiError(404, "Product image not found.", "PRODUCT_IMAGE_NOT_FOUND");
  return sendSvg(res, renderProductImage({
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    brand: product.brand,
    unit: product.unit
  }));
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

  return sendOk(res, products.map((product) => ({
    ...product,
    imageUrl: product.imageUrl || catalogueImagePath("products", product.id)
  })));
}));
