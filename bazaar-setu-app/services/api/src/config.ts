import "dotenv/config";
import { z } from "zod";

const booleanEnv = z
  .enum(["true", "false", "1", "0", "yes", "no", "on", "off"])
  .transform((value) => ["true", "1", "yes", "on"].includes(value));

const optionalUrlEnv = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url().optional()
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DEPLOYMENT_ENV: z.enum(["local", "test", "staging", "production"]).optional(),
  API_PORT: z.coerce.number().int().positive().optional(),
  PORT: z.coerce.number().int().positive().optional(),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  API_BASE_URL: optionalUrlEnv,
  CORS_ORIGINS: z.string().optional(),
  REQUEST_BODY_LIMIT: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().optional(),
  DEMO_AUTH_ENABLED: booleanEnv.optional(),
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: optionalUrlEnv,
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().optional(),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().optional(),
  OTP_TTL_SECONDS: z.coerce.number().int().positive().optional(),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().optional(),
  OTP_DELIVERY_MODE: z.enum(["provider", "mock"]).optional(),
  OTP_PROVIDER_URL: optionalUrlEnv,
  MAPS_PROVIDER: z.enum(["google", "browser"]).optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  PAYMENTS_PROVIDER: z.enum(["razorpay", "mock"]).optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  OTP_PROVIDER_API_KEY: z.string().optional(),
  OTP_PROVIDER_SENDER: z.string().optional(),
  OTP_CODE_PEPPER: z.string().optional(),
  ADMIN_BOOTSTRAP_TOKEN: z.string().optional()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid API environment: ${parsedEnv.error.message}`);
}

const env = parsedEnv.data;
const isProduction = env.NODE_ENV === "production";
const deploymentEnv = env.DEPLOYMENT_ENV ?? (isProduction ? "production" : env.NODE_ENV);
const otpDeliveryMode = env.OTP_DELIVERY_MODE ?? (env.OTP_PROVIDER_URL ? "provider" : "mock");
const mapsProvider = env.MAPS_PROVIDER ?? (env.GOOGLE_MAPS_API_KEY ? "google" : "browser");
const paymentsProvider = env.PAYMENTS_PROVIDER ?? (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET ? "razorpay" : "mock");

function parseCorsOrigins(value?: string) {
  if (!value || value.trim() === "*") return ["*"];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  nodeEnv: env.NODE_ENV,
  deploymentEnv,
  isProduction,
  port: env.API_PORT ?? env.PORT ?? 5010,
  databaseUrl: env.DATABASE_URL ?? "",
  jwtSecret: env.JWT_SECRET ?? "dev-secret-change-me",
  apiBaseUrl: env.API_BASE_URL ?? "http://127.0.0.1:5010",
  corsOrigins: parseCorsOrigins(env.CORS_ORIGINS),
  requestBodyLimit: env.REQUEST_BODY_LIMIT ?? "2mb",
  rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS ?? 60_000,
  rateLimitMax: env.RATE_LIMIT_MAX ?? 60,
  demoAuthEnabled: env.DEMO_AUTH_ENABLED ?? !isProduction,
  redisUrl: env.REDIS_URL ?? "",
  upstashRedisRestUrl: env.UPSTASH_REDIS_REST_URL ?? "",
  upstashRedisRestToken: env.UPSTASH_REDIS_REST_TOKEN ?? "",
  accessTokenTtlSeconds: env.ACCESS_TOKEN_TTL_SECONDS ?? 15 * 60,
  refreshTokenTtlDays: env.REFRESH_TOKEN_TTL_DAYS ?? 30,
  otpTtlSeconds: env.OTP_TTL_SECONDS ?? 5 * 60,
  otpMaxAttempts: env.OTP_MAX_ATTEMPTS ?? 5,
  otpDeliveryMode,
  otpProviderUrl: env.OTP_PROVIDER_URL ?? "",
  mapsProvider,
  googleMapsApiKey: env.GOOGLE_MAPS_API_KEY ?? "",
  paymentsProvider,
  razorpayKeyId: env.RAZORPAY_KEY_ID ?? "",
  razorpayKeySecret: env.RAZORPAY_KEY_SECRET ?? "",
  otpProviderApiKey: env.OTP_PROVIDER_API_KEY ?? "",
  otpProviderSender: env.OTP_PROVIDER_SENDER ?? "Bazaar Setu",
  otpCodePepper: env.OTP_CODE_PEPPER ?? "",
  adminBootstrapToken: env.ADMIN_BOOTSTRAP_TOKEN ?? ""
};

export function readinessBlockers() {
  const blockers: string[] = [];
  if (!config.isProduction) return blockers;
  if (!config.databaseUrl) blockers.push("DATABASE_URL is required.");
  if (!config.redisUrl && !(config.upstashRedisRestUrl && config.upstashRedisRestToken)) {
    blockers.push("REDIS_URL or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN is required for production rate limits.");
  }
  if (config.demoAuthEnabled) blockers.push("DEMO_AUTH_ENABLED must be false in production.");
  if (!config.jwtSecret || config.jwtSecret.includes("change-me") || config.jwtSecret.length < 32) {
    blockers.push("JWT_SECRET must be a strong secret with at least 32 characters.");
  }
  if (config.otpDeliveryMode === "mock" && config.deploymentEnv === "production") {
    blockers.push("OTP_DELIVERY_MODE=mock is allowed only for staging/test, not production launch.");
  }
  if (config.otpDeliveryMode === "provider") {
    if (!config.otpProviderUrl) blockers.push("OTP_PROVIDER_URL is required.");
    if (!config.otpProviderApiKey) blockers.push("OTP_PROVIDER_API_KEY is required.");
  }
  if (config.mapsProvider === "browser" && config.deploymentEnv === "production") {
    blockers.push("MAPS_PROVIDER=browser is allowed only for staging/test, not production launch.");
  }
  if (config.mapsProvider === "google" && !config.googleMapsApiKey) blockers.push("GOOGLE_MAPS_API_KEY is required.");
  if (!config.otpCodePepper || config.otpCodePepper.length < 32) blockers.push("OTP_CODE_PEPPER must be a strong secret with at least 32 characters.");
  if (!config.adminBootstrapToken || config.adminBootstrapToken.length < 32) {
    blockers.push("ADMIN_BOOTSTRAP_TOKEN must be a strong secret with at least 32 characters.");
  }
  if (config.paymentsProvider === "mock" && config.deploymentEnv === "production") {
    blockers.push("PAYMENTS_PROVIDER=mock is allowed only for staging/test, not production launch.");
  }
  if (config.paymentsProvider === "razorpay" && (!config.razorpayKeyId || !config.razorpayKeySecret)) {
    blockers.push("Payment gateway keys are required.");
  }
  return blockers;
}
