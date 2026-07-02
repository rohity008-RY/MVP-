import { Router } from "express";
import { config, readinessBlockers } from "../config.js";
import { prisma } from "../db.js";
import { asyncHandler } from "../http.js";
import { pingRateLimitStore } from "../rate-limit-store.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    ok: true,
    data: {
      status: "ok",
      env: config.nodeEnv,
      deploymentEnv: config.deploymentEnv,
      uptimeSeconds: Math.floor(process.uptime())
    }
  });
});

function sanitizeDependencyError(error: unknown) {
  if (!error) return undefined;
  return error instanceof Error ? error.message : "Dependency check failed.";
}

async function checkDatabase() {
  const startedAt = Date.now();
  if (!config.databaseUrl) {
    return {
      ok: !config.isProduction,
      configured: false,
      latencyMs: Date.now() - startedAt,
      error: config.isProduction ? "DATABASE_URL is not configured." : undefined
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      ok: true,
      configured: true,
      latencyMs: Date.now() - startedAt
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      latencyMs: Date.now() - startedAt,
      error: sanitizeDependencyError(error)
    };
  }
}

healthRouter.get("/ready", asyncHandler(async (_req, res) => {
  const blockers = readinessBlockers();
  const [database, rateLimitStore] = await Promise.all([checkDatabase(), pingRateLimitStore()]);
  const ready = blockers.length === 0 && database.ok && rateLimitStore.ok;

  res.status(ready ? 200 : 503).json({
    ok: ready,
    data: {
      status: ready ? "ready" : "not_ready",
      blockers,
      dependencies: {
        database,
        rateLimitStore
      },
      apps: {
        customer: "apps/customer-mobile",
        seller: "apps/seller-mobile",
        admin: "apps/admin-web"
      },
      config: {
        redisConfigured: Boolean(config.redisUrl || (config.upstashRedisRestUrl && config.upstashRedisRestToken)),
        redisMode: config.redisUrl ? "tcp" : config.upstashRedisRestUrl && config.upstashRedisRestToken ? "upstash-rest" : "memory",
        mapsProvider: config.mapsProvider,
        googleMapsConfigured: config.mapsProvider === "browser" || Boolean(config.googleMapsApiKey),
        paymentsProvider: config.paymentsProvider,
        paymentsConfigured: config.paymentsProvider === "mock" || Boolean(config.razorpayKeyId && config.razorpayKeySecret),
        otpDeliveryMode: config.otpDeliveryMode,
        otpProviderConfigured: config.otpDeliveryMode === "mock" || Boolean(config.otpProviderUrl && config.otpProviderApiKey),
        adminBootstrapConfigured: Boolean(config.adminBootstrapToken),
        demoAuthEnabled: config.demoAuthEnabled
      }
    }
  });
}));

healthRouter.get("/config-readiness", (_req, res) => {
  const blockers = readinessBlockers();
  res.json({
    ok: blockers.length === 0,
    data: {
      status: blockers.length ? "not_ready" : "ready",
      blockers,
      apps: {
        customer: "apps/customer-mobile",
        seller: "apps/seller-mobile",
        admin: "apps/admin-web"
      },
      dependencies: {
        redisConfigured: Boolean(config.redisUrl || (config.upstashRedisRestUrl && config.upstashRedisRestToken)),
        redisMode: config.redisUrl ? "tcp" : config.upstashRedisRestUrl && config.upstashRedisRestToken ? "upstash-rest" : "memory",
        mapsProvider: config.mapsProvider,
        googleMapsConfigured: config.mapsProvider === "browser" || Boolean(config.googleMapsApiKey),
        paymentsProvider: config.paymentsProvider,
        paymentsConfigured: config.paymentsProvider === "mock" || Boolean(config.razorpayKeyId && config.razorpayKeySecret),
        otpDeliveryMode: config.otpDeliveryMode,
        otpProviderConfigured: config.otpDeliveryMode === "mock" || Boolean(config.otpProviderUrl && config.otpProviderApiKey),
        adminBootstrapConfigured: Boolean(config.adminBootstrapToken),
        demoAuthEnabled: config.demoAuthEnabled
      }
    }
  });
});
