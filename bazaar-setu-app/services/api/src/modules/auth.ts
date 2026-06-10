import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { prisma } from "../db.js";
import { ApiError, asyncHandler, sendOk } from "../http.js";
import {
  createAuthSession,
  ensureRoleProfiles,
  generateOtpCode,
  hashOtpCode,
  hashRefreshToken,
  rotateRefreshSession,
  safeEqual
} from "../auth-service.js";
import { rateLimit, requireRole } from "../middleware.js";
import { sendOtp } from "../otp-provider.js";

export const authRouter = Router();
authRouter.use(rateLimit("auth"));

const startOtpSchema = z.object({
  phone: z.string().min(10).transform((phone) => phone.trim()),
  role: z.enum(["CUSTOMER", "SELLER", "ADMIN", "SUPPORT"]).default("CUSTOMER")
});

authRouter.post("/otp/start", asyncHandler(async (req, res) => {
  const input = startOtpSchema.parse(req.body);

  if (["ADMIN", "SUPPORT"].includes(input.role)) {
    const existingStaff = await prisma.user.findUnique({ where: { phone: input.phone } });
    if (!existingStaff || existingStaff.role !== input.role) {
      throw new ApiError(403, "Admin/support users must be provisioned before login.", "STAFF_NOT_PROVISIONED");
    }
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + config.otpTtlSeconds * 1000);
  const challenge = await prisma.otpChallenge.create({
    data: {
      phone: input.phone,
      role: input.role,
      codeHash: hashOtpCode(input.phone, code),
      expiresAt
    }
  });
  const sent = await sendOtp({ phone: input.phone, code, requestId: challenge.id });

  if (sent.providerMessageId) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { providerMessageId: sent.providerMessageId }
    });
  }

  return sendOk(res, {
    requestId: challenge.id,
    expiresAt,
    phone: input.phone,
    role: input.role,
    demoOtp: sent.demoOtp
  });
}));

authRouter.post("/otp/verify", asyncHandler(async (req, res) => {
  const input = startOtpSchema.extend({
    requestId: z.string().optional(),
    otp: z.string().length(6),
    name: z.string().optional()
  }).parse(req.body);

  const challenge = input.requestId
    ? await prisma.otpChallenge.findFirst({
        where: { id: input.requestId, phone: input.phone, role: input.role }
      })
    : await prisma.otpChallenge.findFirst({
        where: { phone: input.phone, role: input.role, consumedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" }
      });

  if (!challenge || challenge.consumedAt || challenge.expiresAt <= new Date()) {
    throw new ApiError(401, "OTP is invalid or expired.", "OTP_INVALID_OR_EXPIRED");
  }
  if (challenge.attempts >= config.otpMaxAttempts) {
    throw new ApiError(429, "OTP attempt limit reached. Please request a new OTP.", "OTP_ATTEMPTS_EXCEEDED");
  }

  const validOtp = safeEqual(challenge.codeHash, hashOtpCode(input.phone, input.otp));
  if (!validOtp) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } }
    });
    throw new ApiError(401, "Invalid OTP.", "INVALID_OTP");
  }

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() }
  });

  const existingUser = await prisma.user.findUnique({ where: { phone: input.phone } });
  let user = existingUser;

  if (["ADMIN", "SUPPORT"].includes(input.role)) {
    if (!user || user.role !== input.role) {
      throw new ApiError(403, "Admin/support users must be provisioned before login.", "STAFF_NOT_PROVISIONED");
    }
  } else {
    if (user && ["ADMIN", "SUPPORT"].includes(user.role)) {
      throw new ApiError(403, "This phone number is reserved for staff login.", "STAFF_PHONE_RESERVED");
    }

    user = await prisma.user.upsert({
      where: { phone: input.phone },
      update: { role: input.role, name: input.name ?? existingUser?.name ?? "Bazaar Setu User" },
      create: { phone: input.phone, role: input.role, name: input.name ?? "Bazaar Setu User" }
    });
  }

  const profiles = await ensureRoleProfiles(user);
  const sessionTokens = await createAuthSession(user, profiles, {
    userAgent: req.header("user-agent"),
    ipAddress: req.ip
  });

  return sendOk(res, {
    token: sessionTokens.accessToken,
    accessToken: sessionTokens.accessToken,
    refreshToken: sessionTokens.refreshToken,
    expiresInSeconds: sessionTokens.expiresInSeconds,
    user,
    customerProfile: profiles.customerProfile,
    sellerProfile: profiles.sellerProfile
  });
}));

authRouter.post("/refresh", asyncHandler(async (req, res) => {
  const input = z.object({ refreshToken: z.string().min(40) }).parse(req.body);
  const session = await rotateRefreshSession(input.refreshToken);
  return sendOk(res, {
    token: session.accessToken,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresInSeconds: session.expiresInSeconds,
    user: session.user,
    customerProfile: session.customerProfile,
    sellerProfile: session.sellerProfile
  });
}));

authRouter.post("/logout", asyncHandler(async (req, res) => {
  const input = z.object({
    refreshToken: z.string().min(40).optional(),
    allDevices: z.boolean().optional()
  }).parse(req.body);

  if (input.allDevices) {
    if (!req.user) throw new ApiError(401, "Authentication required.", "AUTH_REQUIRED");
    await prisma.authSession.updateMany({
      where: { userId: req.user.id, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    return sendOk(res, { revoked: "all" });
  }

  if (!input.refreshToken) throw new ApiError(400, "refreshToken is required.", "REFRESH_TOKEN_REQUIRED");
  await prisma.authSession.updateMany({
    where: { refreshTokenHash: hashRefreshToken(input.refreshToken), revokedAt: null },
    data: { revokedAt: new Date() }
  });
  return sendOk(res, { revoked: "current" });
}));

authRouter.get("/me", requireRole("CUSTOMER", "SELLER", "ADMIN", "SUPPORT"), asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required.", "AUTH_REQUIRED");
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { customerProfile: true, sellerProfile: true }
  });
  if (!user) throw new ApiError(404, "User not found.", "USER_NOT_FOUND");
  return sendOk(res, { user, customerProfile: user.customerProfile, sellerProfile: user.sellerProfile });
}));

authRouter.post("/admin/bootstrap", asyncHandler(async (req, res) => {
  const input = z.object({
    phone: z.string().min(10).transform((phone) => phone.trim()),
    name: z.string().min(2),
    email: z.string().email().optional(),
    bootstrapToken: z.string().optional()
  }).parse(req.body);

  const providedToken = req.header("x-admin-bootstrap-token") ?? input.bootstrapToken;
  if (!config.adminBootstrapToken) throw new ApiError(404, "Admin bootstrap is not enabled.", "ADMIN_BOOTSTRAP_DISABLED");
  if (!providedToken || !safeEqual(providedToken, config.adminBootstrapToken)) {
    throw new ApiError(403, "Invalid admin bootstrap token.", "INVALID_ADMIN_BOOTSTRAP_TOKEN");
  }

  const existingAdminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (existingAdminCount > 0) {
    throw new ApiError(409, "Initial admin has already been provisioned.", "ADMIN_ALREADY_PROVISIONED");
  }

  const user = await prisma.user.upsert({
    where: { phone: input.phone },
    update: { role: "ADMIN", name: input.name, email: input.email },
    create: { phone: input.phone, role: "ADMIN", name: input.name, email: input.email }
  });

  return sendOk(res, { user }, 201);
}));
