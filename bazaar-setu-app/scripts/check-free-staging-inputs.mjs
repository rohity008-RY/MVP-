const required = [
  "NEON_DATABASE_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN"
];

const optionalDefaults = {
  RENDER_API_URL: "https://bazaar-setu-api-free.onrender.com",
  RENDER_ADMIN_URL: "https://bazaar-setu-admin-free.onrender.com"
};

function value(name) {
  return process.env[name]?.trim() || "";
}

function parseUrl(raw, label) {
  try {
    return new URL(raw);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
}

function assertNoCompanyProject(raw, label) {
  if (/(^|[-_.])(?:fynd|gofynd)([-_.]|$)/i.test(raw)) {
    throw new Error(`${label} must not use Fynd/GoFynd/shared company resources.`);
  }
}

function masked(valueToMask) {
  if (!valueToMask) return "";
  if (valueToMask.length <= 8) return "********";
  return `${valueToMask.slice(0, 4)}...${valueToMask.slice(-4)}`;
}

function summarizeDatabase(raw) {
  const url = parseUrl(raw, "NEON_DATABASE_URL");
  if (!["postgresql:", "postgres:"].includes(url.protocol)) {
    throw new Error("NEON_DATABASE_URL must use postgresql:// or postgres://.");
  }
  if (!url.searchParams.has("sslmode") || url.searchParams.get("sslmode") !== "require") {
    throw new Error("NEON_DATABASE_URL must include sslmode=require.");
  }
  assertNoCompanyProject(url.hostname, "NEON_DATABASE_URL host");
  return {
    protocol: url.protocol.replace(":", ""),
    host: url.hostname,
    database: url.pathname.replace("/", "") || "(default)",
    sslmode: url.searchParams.get("sslmode")
  };
}

function summarizeUpstashUrl(raw) {
  const url = parseUrl(raw, "UPSTASH_REDIS_REST_URL");
  if (url.protocol !== "https:") throw new Error("UPSTASH_REDIS_REST_URL must use https://.");
  assertNoCompanyProject(url.hostname, "UPSTASH_REDIS_REST_URL host");
  return {
    host: url.hostname
  };
}

function summarizeRenderUrl(raw, label) {
  const url = parseUrl(raw, label);
  if (url.protocol !== "https:") throw new Error(`${label} must use https://.`);
  assertNoCompanyProject(url.hostname, `${label} host`);
  return {
    host: url.hostname
  };
}

const missing = required.filter((name) => !value(name));
if (missing.length) {
  console.error("Missing required free staging values:");
  for (const name of missing) console.error(`- ${name}`);
  console.error("\nExample:");
  console.error("NEON_DATABASE_URL=\"postgresql://...?sslmode=require\" \\");
  console.error("UPSTASH_REDIS_REST_URL=\"https://...upstash.io\" \\");
  console.error("UPSTASH_REDIS_REST_TOKEN=\"...\" \\");
  console.error("npm run check:free-staging");
  process.exit(1);
}

try {
  const renderApiUrl = value("RENDER_API_URL") || optionalDefaults.RENDER_API_URL;
  const renderAdminUrl = value("RENDER_ADMIN_URL") || optionalDefaults.RENDER_ADMIN_URL;

  const summary = {
    neon: summarizeDatabase(value("NEON_DATABASE_URL")),
    upstash: {
      ...summarizeUpstashUrl(value("UPSTASH_REDIS_REST_URL")),
      token: masked(value("UPSTASH_REDIS_REST_TOKEN"))
    },
    render: {
      api: summarizeRenderUrl(renderApiUrl, "RENDER_API_URL"),
      admin: summarizeRenderUrl(renderAdminUrl, "RENDER_ADMIN_URL")
    }
  };

  console.log("Bazaar Setu free staging input check passed.");
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
