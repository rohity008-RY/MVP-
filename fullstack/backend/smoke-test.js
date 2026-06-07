const { spawn } = require("child_process");

const PORT = 5011;
const BASE = `http://127.0.0.1:${PORT}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok || payload.ok === false) {
    throw new Error(`${options.method || "GET"} ${path} failed: ${JSON.stringify(payload)}`);
  }
  return payload.data || payload;
}

async function getText(path) {
  const res = await fetch(`${BASE}${path}`);
  const text = await res.text();
  if (!res.ok) throw new Error(`GET ${path} failed: ${text}`);
  return text;
}

function assert(name, value, checks) {
  checks.push({ name, pass: Boolean(value) });
}

async function run() {
  const server = spawn(process.execPath, ["backend/server.js"], {
    cwd: `${__dirname}/..`,
    env: { ...process.env, PORT: String(PORT) },
    stdio: "pipe"
  });

  try {
    await wait(800);
    const checks = [];
    const health = await request("/api/health");
    assert("health endpoint", health.status === "ok", checks);

    const ready = await request("/api/ready");
    assert("readiness endpoint", Boolean(ready.apps.customer && ready.apps.seller && ready.apps.adminSupport), checks);

    const openapi = await request("/api/openapi.json");
    assert("openapi endpoint", openapi.openapi === "3.0.3", checks);

    const landing = await getText("/");
    const customerApp = await getText("/customer");
    const sellerApp = await getText("/seller");
    const adminApp = await getText("/admin");
    const customerManifest = await request("/customer/manifest.json");
    const sellerManifest = await request("/seller/manifest.json");
    const adminManifest = await request("/admin/manifest.json");
    const serviceWorker = await getText("/shared/sw.js");
    assert("landing route loads", landing.includes("Application Selector"), checks);
    assert("customer app route loads", customerApp.includes("BazaarSetu - Customer App"), checks);
    assert("seller app route loads", sellerApp.includes("BazaarSetu — Seller App"), checks);
    assert("admin support route loads", adminApp.includes("BazaarSetu — Operations"), checks);
    assert("customer manifest loads", customerManifest.start_url === "/customer", checks);
    assert("seller manifest loads", sellerManifest.start_url === "/seller", checks);
    assert("admin manifest loads", adminManifest.start_url === "/admin", checks);
    assert("service worker loads", serviceWorker.includes("CACHE_NAME"), checks);

    await request("/api/dev/reset", { method: "POST", body: "{}" });
    const categories = await request("/api/catalogue/categories");
    assert("categories load", categories.length >= 10, checks);

    const products = await request("/api/catalogue/products?q=milk");
    assert("product search works", products.some((product) => product.name.includes("Milk")), checks);

    const address = await request("/api/customer/addresses", {
      method: "POST",
      body: JSON.stringify({ type: "Other", label: "Smoke Address", line: "Test lane", lat: 19.1, lng: 72.8 })
    });
    assert("address create works", address.id, checks);

    const order = await request("/api/customer/orders", {
      method: "POST",
      body: JSON.stringify({ items: [{ productId: "milk", qty: 1 }], addressId: address.id, paymentMethod: "upi" })
    });
    assert("checkout creates order", order.subOrders.length === 1, checks);

    const subOrder = await request(`/api/seller/orders/${order.subOrders[0].id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "confirm" })
    });
    assert("seller confirm auto invoices", Boolean(subOrder.invoiceNumber), checks);

    const notification = await request("/api/admin/notifications", {
      method: "POST",
      body: JSON.stringify({ audience: "customer", type: "offer", title: "Smoke Offer", body: "Smoke notification" })
    });
    assert("admin publishes notification", notification.id, checks);

    const dashboard = await request("/api/admin/dashboard");
    assert("admin dashboard loads", dashboard.totals.orders >= 1, checks);

    const adminOrders = await request("/api/admin/orders");
    assert("admin order monitor loads", adminOrders.length >= 1, checks);

    const sellers = await request("/api/admin/sellers");
    assert("admin sellers load", sellers.some((seller) => seller.id === "seller-1"), checks);

    const notifications = await request("/api/notifications?audience=customer");
    assert("customer receives notification", notifications.some((item) => item.title === "Smoke Offer"), checks);

    const productRequest = await request("/api/seller/product-requests", {
      method: "POST",
      body: JSON.stringify({ name: "Smoke Pickle", categoryId: "packaged-food", unit: "250 g jar" })
    });
    await request(`/api/admin/product-requests/${productRequest.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Approved" })
    });
    const updated = await request("/api/catalogue/products?q=Smoke Pickle");
    assert("admin approval adds product", updated.some((product) => product.name === "Smoke Pickle"), checks);

    const failed = checks.filter((check) => !check.pass);
    console.log(JSON.stringify({ status: failed.length ? "failed" : "passed", checks }, null, 2));
    process.exitCode = failed.length ? 1 : 0;
  } finally {
    server.kill();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
