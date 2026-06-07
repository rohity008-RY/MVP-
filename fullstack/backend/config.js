function boolEnv(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function listEnv(name, fallback = []) {
  const value = process.env[name];
  if (!value) return fallback;
  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
}

const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";

const config = {
  appName: "Bazaar Setu",
  env,
  isProduction,
  host: process.env.HOST || (isProduction ? "0.0.0.0" : "127.0.0.1"),
  port: Number(process.env.PORT || 5010),
  dataFile: process.env.DATA_FILE || "",
  corsOrigins: listEnv("CORS_ORIGINS", isProduction ? [] : ["*"]),
  demoAuthEnabled: boolEnv("DEMO_AUTH_ENABLED", !isProduction),
  devResetEnabled: boolEnv("DEV_RESET_ENABLED", !isProduction),
  requestLogEnabled: boolEnv("REQUEST_LOG_ENABLED", true),
  maxBodyBytes: Number(process.env.MAX_BODY_BYTES || 2_000_000),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://127.0.0.1:5010",
  integrations: {
    googleMaps: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    otpProvider: Boolean(process.env.OTP_PROVIDER_API_KEY),
    paymentGateway: Boolean(process.env.PAYMENT_GATEWAY_KEY_ID && process.env.PAYMENT_GATEWAY_KEY_SECRET),
    pushNotifications: Boolean(process.env.PUSH_PROVIDER_KEY),
    objectStorage: Boolean(process.env.OBJECT_STORAGE_BUCKET)
  }
};

module.exports = { config };
