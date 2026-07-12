const apiBaseUrl = process.env.STAGING_API_URL;
const adminBaseUrl = process.env.STAGING_ADMIN_URL;

if (!apiBaseUrl) {
  throw new Error("STAGING_API_URL is required.");
}

async function readJson(url) {
  const response = await fetch(url);
  const body = await response.text();
  let json;
  try {
    json = JSON.parse(body);
  } catch {
    throw new Error(`${url} did not return JSON. Status ${response.status}. Body: ${body.slice(0, 300)}`);
  }
  if (!response.ok || json.ok === false) {
    throw new Error(`${url} failed with status ${response.status}: ${body.slice(0, 500)}`);
  }
  return json;
}

async function readJsonWithStatus(url, expectedStatus) {
  const response = await fetch(url);
  const body = await response.text();
  let json;
  try {
    json = JSON.parse(body);
  } catch {
    throw new Error(`${url} did not return JSON. Status ${response.status}. Body: ${body.slice(0, 300)}`);
  }
  if (response.status !== expectedStatus) {
    throw new Error(`${url} expected status ${expectedStatus} but got ${response.status}: ${body.slice(0, 500)}`);
  }
  return json;
}

const health = await readJson(`${apiBaseUrl}/api/health`);
const ready = await readJson(`${apiBaseUrl}/api/ready`);
const protectedOps = await readJsonWithStatus(`${apiBaseUrl}/api/ops/dashboard`, 401);

if (health.data?.status !== "ok") {
  throw new Error(`Unexpected health status: ${JSON.stringify(health)}`);
}

if (ready.data?.status !== "ready") {
  throw new Error(`API is not ready: ${JSON.stringify(ready.data?.blockers ?? ready)}`);
}

if (protectedOps.error?.code !== "AUTH_REQUIRED") {
  throw new Error(`Ops backend should require auth, got: ${JSON.stringify(protectedOps)}`);
}

const config = ready.data?.config ?? {};
const dependencies = ready.data?.dependencies ?? {};
const expected = [
  ["config.redisConfigured", config.redisConfigured, true],
  ["config.redisMode", config.redisMode, "upstash-rest"],
  ["config.otpDeliveryMode", config.otpDeliveryMode, "mock"],
  ["config.mapsProvider", config.mapsProvider, "browser"],
  ["config.paymentsProvider", config.paymentsProvider, "mock"],
  ["config.adminBootstrapConfigured", config.adminBootstrapConfigured, true],
  ["dependencies.database.ok", dependencies.database?.ok, true],
  ["dependencies.rateLimitStore.ok", dependencies.rateLimitStore?.ok, true]
];

for (const [label, actual, wanted] of expected) {
  if (actual !== wanted) {
    throw new Error(`${label} expected ${JSON.stringify(wanted)} but got ${JSON.stringify(actual)}.`);
  }
}

if (adminBaseUrl) {
  const adminResponse = await fetch(`${adminBaseUrl}/health`);
  if (!adminResponse.ok) {
    throw new Error(`Admin web failed with status ${adminResponse.status}`);
  }
}

console.log("Bazaar Setu staging smoke passed.");
console.log(`API health: ${health.data?.status}`);
console.log(`API ready: ${ready.data?.status}`);
console.log(`Database latency: ${dependencies.database?.latencyMs ?? "n/a"}ms`);
console.log(`Rate limit store: ${dependencies.rateLimitStore?.mode ?? "n/a"}`);
console.log("Ops backend: protected");
