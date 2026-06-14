import { Router } from "express";
import { config, readinessBlockers } from "../config.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({ ok: true, data: { status: "ok", env: config.nodeEnv } });
});

healthRouter.get("/ready", (_req, res) => {
  const blockers = readinessBlockers();
  res.json({
    ok: true,
    data: {
      status: blockers.length ? "not_ready" : "ready",
      blockers,
      apps: {
        customer: "apps/customer-mobile",
        seller: "apps/seller-mobile",
        admin: "apps/admin-web"
      },
      dependencies: {
        redisConfigured: Boolean(config.redisUrl),
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
