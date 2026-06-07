import "dotenv/config";

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.API_PORT ?? process.env.PORT ?? 5010),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  apiBaseUrl: process.env.API_BASE_URL ?? "http://127.0.0.1:5010",
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
  otpProviderApiKey: process.env.OTP_PROVIDER_API_KEY ?? ""
};

export function readinessBlockers() {
  const blockers: string[] = [];
  if (config.nodeEnv === "production" && config.jwtSecret.includes("change-me")) blockers.push("JWT_SECRET must be set.");
  if (config.nodeEnv === "production" && !config.googleMapsApiKey) blockers.push("GOOGLE_MAPS_API_KEY is required.");
  if (config.nodeEnv === "production" && !config.otpProviderApiKey) blockers.push("OTP_PROVIDER_API_KEY is required.");
  if (config.nodeEnv === "production" && (!config.razorpayKeyId || !config.razorpayKeySecret)) blockers.push("Payment gateway keys are required.");
  return blockers;
}
