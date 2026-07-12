import { randomBytes } from "node:crypto";

function secret(byteLength = 32) {
  return randomBytes(byteLength).toString("base64url");
}

function envValue(name, fallback) {
  return process.env[name]?.trim() || fallback;
}

const apiUrl = envValue("RENDER_API_URL", "https://bazaar-setu-api-free.onrender.com");
const adminUrl = envValue("RENDER_ADMIN_URL", "https://bazaar-setu-admin-free.onrender.com");
const databaseUrl = envValue("NEON_DATABASE_URL", "<paste Neon direct DATABASE_URL with sslmode=require>");
const upstashRestUrl = envValue("UPSTASH_REDIS_REST_URL", "<paste Upstash REST URL>");
const upstashRestToken = envValue("UPSTASH_REDIS_REST_TOKEN", "<paste Upstash REST token>");

const generated = {
  JWT_SECRET: secret(),
  OTP_CODE_PEPPER: secret(),
  ADMIN_BOOTSTRAP_TOKEN: secret()
};

const apiEnv = {
  API_BASE_URL: apiUrl,
  CORS_ORIGINS: adminUrl,
  DATABASE_URL: databaseUrl,
  UPSTASH_REDIS_REST_URL: upstashRestUrl,
  UPSTASH_REDIS_REST_TOKEN: upstashRestToken,
  ...generated
};

const adminEnv = {
  NEXT_PUBLIC_API_BASE_URL: apiUrl
};

console.log("# Bazaar Setu Render Free Staging Values");
console.log("# Paste these into the Render service environment variables marked sync:false.");
console.log("# Keep secrets private. Rotate ADMIN_BOOTSTRAP_TOKEN after first admin bootstrap.\n");

console.log("## API service: bazaar-setu-api-free");
for (const [key, value] of Object.entries(apiEnv)) {
  console.log(`${key}=${value}`);
}

console.log("\n## Admin service: bazaar-setu-admin-free");
for (const [key, value] of Object.entries(adminEnv)) {
  console.log(`${key}=${value}`);
}

console.log("\n## Smoke test command after deploy");
console.log(`STAGING_API_URL=${apiUrl} STAGING_ADMIN_URL=${adminUrl} npm run smoke:free-staging`);
