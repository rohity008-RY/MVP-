import { randomBytes } from "node:crypto";

function secret(byteLength = 32) {
  return randomBytes(byteLength).toString("base64url");
}

const secrets = {
  JWT_SECRET: secret(),
  OTP_CODE_PEPPER: secret(),
  ADMIN_BOOTSTRAP_TOKEN: secret()
};

console.log("# Paste these into Render API environment variables:");
for (const [key, value] of Object.entries(secrets)) {
  console.log(`${key}=${value}`);
}
