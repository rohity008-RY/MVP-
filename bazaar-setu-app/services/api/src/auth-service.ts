import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import type { CustomerProfile, SellerProfile, User } from "@prisma/client";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { prisma } from "./db.js";
import { ApiError } from "./http.js";
import type { AuthUser } from "./middleware.js";

export interface AuthProfileBundle {
  customerProfile: CustomerProfile | null;
  sellerProfile: SellerProfile | null;
}

export function generateOtpCode() {
  if (config.demoAuthEnabled) return "123456";
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashOtpCode(phone: string, code: string) {
  const pepper = config.otpCodePepper || config.jwtSecret;
  return createHmac("sha256", pepper).update(`${phone}:${code}`).digest("hex");
}

export function hashRefreshToken(refreshToken: string) {
  return createHash("sha256").update(refreshToken).digest("hex");
}

export function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function ensureRoleProfiles(user: User): Promise<AuthProfileBundle> {
  const customerProfile =
    user.role === "CUSTOMER"
      ? await prisma.customerProfile.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id }
        })
      : null;

  const sellerProfile =
    user.role === "SELLER"
      ? await prisma.sellerProfile.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            ownerName: user.name,
            shopName: `${user.name}'s Store`
          }
        })
      : null;

  return { customerProfile, sellerProfile };
}

export function buildAuthPayload(user: User, profiles: AuthProfileBundle, sessionId: string): AuthUser {
  return {
    id: user.id,
    role: user.role,
    customerId: profiles.customerProfile?.id,
    sellerId: profiles.sellerProfile?.id,
    sessionId
  };
}

export function signAccessToken(payload: AuthUser) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.accessTokenTtlSeconds });
}

export async function createAuthSession(user: User, profiles: AuthProfileBundle, meta: { userAgent?: string; ipAddress?: string }) {
  const refreshToken = randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
  const session = await prisma.authSession.create({
    data: {
      userId: user.id,
      refreshTokenHash: hashRefreshToken(refreshToken),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      expiresAt
    }
  });

  const payload = buildAuthPayload(user, profiles, session.id);
  return {
    accessToken: signAccessToken(payload),
    refreshToken,
    expiresInSeconds: config.accessTokenTtlSeconds,
    session
  };
}

export async function rotateRefreshSession(refreshToken: string) {
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const session = await prisma.authSession.findUnique({
    where: { refreshTokenHash },
    include: { user: true }
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    throw new ApiError(401, "Refresh session is invalid or expired.", "INVALID_REFRESH_SESSION");
  }

  const profiles = await ensureRoleProfiles(session.user);
  const nextRefreshToken = randomBytes(48).toString("base64url");
  const updatedSession = await prisma.authSession.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: hashRefreshToken(nextRefreshToken),
      lastUsedAt: new Date()
    }
  });

  return {
    accessToken: signAccessToken(buildAuthPayload(session.user, profiles, session.id)),
    refreshToken: nextRefreshToken,
    expiresInSeconds: config.accessTokenTtlSeconds,
    session: updatedSession,
    user: session.user,
    ...profiles
  };
}
