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

const health = await readJson(`${apiBaseUrl}/api/health`);
const ready = await readJson(`${apiBaseUrl}/api/ready`);

if (health.data?.status !== "ok") {
  throw new Error(`Unexpected health status: ${JSON.stringify(health)}`);
}

if (ready.data?.status !== "ready") {
  throw new Error(`API is not ready: ${JSON.stringify(ready.data?.blockers ?? ready)}`);
}

if (adminBaseUrl) {
  const adminResponse = await fetch(`${adminBaseUrl}/health`);
  if (!adminResponse.ok) {
    throw new Error(`Admin web failed with status ${adminResponse.status}`);
  }
}

console.log("Bazaar Setu staging smoke passed.");
