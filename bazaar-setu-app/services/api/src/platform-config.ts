import type { Prisma } from "@prisma/client";
import { prisma } from "./db.js";
import { ApiError } from "./http.js";

export type PaymentVendorConfig = {
  id: string;
  label: string;
  enabled: boolean;
};

export type PaymentConfig = {
  vendors: PaymentVendorConfig[];
};

export type RewardConfig = {
  enabled: boolean;
  pointsPerHundred: number;
  welcomeBonus?: number;
  sellerReferralBonus?: number;
};

export const defaultPaymentConfig: PaymentConfig = {
  vendors: [
    { id: "razorpay-upi", label: "UPI via Razorpay", enabled: true },
    { id: "razorpay-cards", label: "Cards via Razorpay", enabled: true },
    { id: "wallet", label: "Bazaar Setu Wallet", enabled: false },
    { id: "cod", label: "Cash on Delivery", enabled: true }
  ]
};

export const defaultRewardConfig: RewardConfig = { enabled: true, pointsPerHundred: 1 };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function normalizePaymentConfig(value: unknown): PaymentConfig {
  if (!isRecord(value) || !Array.isArray(value.vendors)) return defaultPaymentConfig;
  const vendors = value.vendors.flatMap((vendor): PaymentVendorConfig[] => {
    if (!isRecord(vendor) || typeof vendor.id !== "string" || typeof vendor.label !== "string") return [];
    return [{ id: vendor.id, label: vendor.label, enabled: vendor.enabled === true }];
  });
  return vendors.length ? { vendors } : defaultPaymentConfig;
}

export function normalizeRewardConfig(value: unknown): RewardConfig {
  if (!isRecord(value)) return defaultRewardConfig;
  const pointsPerHundred = typeof value.pointsPerHundred === "number" && Number.isFinite(value.pointsPerHundred)
    ? Math.max(0, Math.floor(value.pointsPerHundred))
    : defaultRewardConfig.pointsPerHundred;
  return {
    enabled: value.enabled !== false,
    pointsPerHundred,
    welcomeBonus: typeof value.welcomeBonus === "number" ? Math.max(0, Math.floor(value.welcomeBonus)) : undefined,
    sellerReferralBonus: typeof value.sellerReferralBonus === "number" ? Math.max(0, Math.floor(value.sellerReferralBonus)) : undefined
  };
}

export async function getPaymentConfig() {
  const setting = await prisma.platformSetting.findUnique({ where: { key: "paymentConfig" } });
  return normalizePaymentConfig(setting?.value);
}

export async function getRewardConfig() {
  const setting = await prisma.platformSetting.findUnique({ where: { key: "rewardConfig" } });
  return normalizeRewardConfig(setting?.value);
}

export function resolveEnabledPaymentMethod(config: PaymentConfig, paymentMethodId: string) {
  const method = config.vendors.find((vendor) => vendor.id === paymentMethodId);
  if (!method || !method.enabled) {
    throw new ApiError(400, "Selected payment method is not enabled.", "PAYMENT_METHOD_DISABLED", {
      paymentMethod: paymentMethodId,
      enabledMethods: config.vendors.filter((vendor) => vendor.enabled).map((vendor) => vendor.id)
    });
  }
  return method;
}

export function isCodPaymentMethod(paymentMethodId: string) {
  return paymentMethodId.toLowerCase() === "cod";
}

export function calculateRewardPoints(orderTotal: number, config: RewardConfig) {
  if (!config.enabled || config.pointsPerHundred <= 0 || orderTotal <= 0) return 0;
  return Math.floor(orderTotal / 100) * config.pointsPerHundred;
}

export type RewardTx = Prisma.TransactionClient;

export async function postCheckoutRewards(
  tx: RewardTx,
  input: {
    customerId: string;
    parentOrderId: string;
    orderTotal: number;
    rewardConfig: RewardConfig;
  }
) {
  const points = calculateRewardPoints(input.orderTotal, input.rewardConfig);
  if (points <= 0) return null;

  const ledger = await tx.rewardLedger.create({
    data: {
      customerId: input.customerId,
      parentOrderId: input.parentOrderId,
      points,
      source: "order_checkout",
      reason: `Earned ${points} Bazaar Setu points on order checkout.`,
      metadata: {
        orderTotal: input.orderTotal,
        pointsPerHundred: input.rewardConfig.pointsPerHundred
      }
    }
  });

  await tx.customerProfile.update({
    where: { id: input.customerId },
    data: { rewardPoints: { increment: points } }
  });

  return ledger;
}
