import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";
import { prisma } from "../db.js";
import { ApiError, asyncHandler, sendOk } from "../http.js";
import { rateLimit, type AuthUser } from "../middleware.js";

export const authRouter = Router();
authRouter.use(rateLimit("auth"));

const startOtpSchema = z.object({
  phone: z.string().min(10),
  role: z.enum(["CUSTOMER", "SELLER", "ADMIN", "SUPPORT"]).default("CUSTOMER")
});

authRouter.post("/otp/start", asyncHandler(async (req, res) => {
  const input = startOtpSchema.parse(req.body);
  if (!config.demoAuthEnabled) {
    throw new ApiError(501, "OTP provider integration is required before production login can be enabled.", "OTP_PROVIDER_NOT_IMPLEMENTED");
  }

  return sendOk(res, { requestId: `otp-${Date.now()}`, demoOtp: "123456", phone: input.phone, role: input.role });
}));

authRouter.post("/otp/verify", asyncHandler(async (req, res) => {
  const input = startOtpSchema.extend({ otp: z.string().length(6), name: z.string().optional() }).parse(req.body);
  if (!config.demoAuthEnabled) {
    throw new ApiError(501, "OTP verification provider integration is required before production login can be enabled.", "OTP_PROVIDER_NOT_IMPLEMENTED");
  }
  if (input.otp !== "123456") throw new ApiError(401, "Invalid OTP.", "INVALID_OTP");

  const user = await prisma.user.upsert({
    where: { phone: input.phone },
    update: { role: input.role },
    create: { phone: input.phone, role: input.role, name: input.name ?? "Bazaar Setu User" }
  });

  const customerProfile =
    input.role === "CUSTOMER"
      ? await prisma.customerProfile.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id }
        })
      : null;

  const sellerProfile =
    input.role === "SELLER"
      ? await prisma.sellerProfile.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            ownerName: input.name ?? user.name,
            shopName: `${input.name ?? user.name}'s Store`
          }
        })
      : null;

  const payload: AuthUser = {
    id: user.id,
    role: user.role,
    customerId: customerProfile?.id,
    sellerId: sellerProfile?.id
  };

  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "30d" });
  return sendOk(res, { token, user, customerProfile, sellerProfile });
}));
