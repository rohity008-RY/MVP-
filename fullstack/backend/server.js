const http = require("http");
const fs = require("fs");
const path = require("path");
const { config } = require("./config");
const { id, loadDb, saveDb, resetDb } = require("./db");
const { openApiSpec } = require("./openapi");

const PORT = config.port;
const MOBILE_DIR = path.join(__dirname, "..", "mobile");
const APPS_DIR = path.join(__dirname, "..", "apps");
const LANDING_DIR = path.join(APPS_DIR, "landing");
const CUSTOMER_DIR = path.join(APPS_DIR, "customer");
const SELLER_DIR = path.join(APPS_DIR, "seller");
const ADMIN_DIR = path.join(APPS_DIR, "admin");
const SHARED_DIR = path.join(APPS_DIR, "shared");
const ASSET_DIR = path.join(MOBILE_DIR, "assets");
const SELLER_ID = "seller-1";
const CUSTOMER_ID = "customer-1";

function send(res, status, payload, headers = {}) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "Content-Type": typeof payload === "string" ? "text/html; charset=utf-8" : "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": config.corsOrigins[0] || config.publicBaseUrl,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": "no-store",
    ...headers
  });
  res.end(body);
}

function ok(res, data) {
  send(res, 200, { ok: true, data });
}

function fail(res, status, message, details) {
  send(res, status, { ok: false, error: { message, details } });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > config.maxBodyBytes) req.destroy();
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath);
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg"
  }[ext] || "application/octet-stream";
}

function serveFile(res, rootDir, requested) {
  const safePath = path.normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(rootDir, safePath);
  if (!filePath.startsWith(rootDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return false;
  }
  const immutable = /\.(css|js|svg|png|jpg|jpeg)$/i.test(filePath);
  res.writeHead(200, {
    "Content-Type": contentType(filePath),
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    ...(path.basename(filePath) === "sw.js" ? { "Service-Worker-Allowed": "/" } : {}),
    "Cache-Control": immutable ? "public, max-age=3600" : "no-store"
  });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

function serveStatic(req, res, url) {
  const appRoutes = [
    ["/customer", CUSTOMER_DIR],
    ["/seller", SELLER_DIR],
    ["/admin", ADMIN_DIR],
    ["/shared", SHARED_DIR],
    ["/assets", ASSET_DIR],
    ["/mobile", MOBILE_DIR]
  ];

  if (url.pathname === "/" || url.pathname === "/index.html") {
    return serveFile(res, LANDING_DIR, "/index.html");
  }

  for (const [prefix, rootDir] of appRoutes) {
    if (url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)) {
      const requested = url.pathname === prefix ? "/index.html" : url.pathname.slice(prefix.length);
      return serveFile(res, rootDir, requested || "/index.html");
    }
  }

  return false;
}

function productMap(db) {
  return Object.fromEntries(db.products.map((product) => [product.id, product]));
}

function categoryMap(db) {
  return Object.fromEntries(db.categories.map((category) => [category.id, category]));
}

function enrichProduct(db, product, offer) {
  const category = categoryMap(db)[product.categoryId];
  return {
    ...product,
    categoryName: category?.name || product.categoryId,
    imageColor: product.imageColor || category?.color,
    price: offer?.price ?? product.mrp,
    qty: offer?.qty ?? 0,
    active: offer?.active ?? false,
    sellerProductId: offer?.id || "",
    sellerId: offer?.sellerId || ""
  };
}

function sellerSla(profile) {
  const value = Math.max(1, Number(profile.slaValue || 45));
  const unit = profile.slaUnit || "min";
  const label = unit === "hrs" ? (value === 1 ? "hr" : "hrs") : unit === "day" ? (value === 1 ? "day" : "days") : "min";
  return `${value} ${label}`;
}

function generateInvoice(orderId) {
  return `BS-${orderId.replace(/\D/g, "").slice(-4)}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function printableDocument(db, subOrder, type, format) {
  const seller = db.sellerProfiles[subOrder.sellerId];
  const rows = subOrder.items
    .map((item) => `<tr><td>${item.name}</td><td>${item.hsn || "Optional"}</td><td>${item.qty}</td><td>Rs. ${item.price}</td><td>Rs. ${item.price * item.qty}</td></tr>`)
    .join("");
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${type} ${subOrder.id}</title>
<style>
body{font-family:Arial,sans-serif;margin:24px;color:#111}.doc{max-width:${format === "80mm" ? "302px" : "760px"};border:1px solid #ddd;padding:18px}
header{display:flex;gap:12px;align-items:center;border-bottom:2px solid #111;padding-bottom:12px}img{width:46px;height:46px}
table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #ddd;padding:8px;text-align:left}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.meta div{border:1px solid #ddd;padding:8px}
</style></head><body><section class="doc">
<header><img src="/assets/bazaar-setu-logo.svg" alt=""><div><h1>Bazaar Setu ${type}</h1><p>${format}</p></div></header>
<div class="meta"><div><b>Shipment</b><br>${subOrder.id}</div><div><b>Seller</b><br>${seller.shopName}</div><div><b>FSSAI</b><br>${seller.documents.fssai}</div></div>
${type === "label" ? `<h2>Delivery Label</h2><p>Customer address and delivery partner QR placeholder.</p>` : `<table><thead><tr><th>Item</th><th>HSN</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>`}
<p>Support: support@bazaarsetu.example</p></section></body></html>`;
}

function adminDashboard(db) {
  const sellerOrders = db.orders.flatMap((order) => order.subOrders);
  const placed = sellerOrders.filter((order) => order.status === "Placed").length;
  const packed = sellerOrders.filter((order) => order.status === "Bag Packed").length;
  const rejected = sellerOrders.filter((order) => order.status === "Rejected").length;
  return {
    totals: {
      orders: db.orders.length,
      sellerSubOrders: sellerOrders.length,
      placed,
      packed,
      rejected,
      sellers: Object.keys(db.sellerProfiles).length,
      productRequests: db.productRequests.filter((request) => request.status === "Pending").length,
      notifications: db.notifications.length
    },
    paymentMethods: db.settings.paymentMethods,
    rewards: db.settings.rewards
  };
}

function readiness(db) {
  const blockers = [];
  if (config.isProduction && config.demoAuthEnabled) blockers.push("DEMO_AUTH_ENABLED must be false for public production.");
  if (config.isProduction && config.devResetEnabled) blockers.push("DEV_RESET_ENABLED must be false for public production.");
  if (config.isProduction && !config.integrations.googleMaps) blockers.push("Google Maps key missing for real address/lat-long capture.");
  if (config.isProduction && !config.integrations.paymentGateway) blockers.push("Payment gateway credentials missing.");
  if (config.isProduction && !config.integrations.otpProvider) blockers.push("OTP provider credentials missing.");

  return {
    status: blockers.length ? "not_ready" : "ready",
    env: config.env,
    version: db.version,
    apps: {
      customer: "/customer",
      seller: "/seller",
      adminSupport: "/admin"
    },
    dataFile: config.dataFile || "backend/data/db.json",
    demoAuthEnabled: config.demoAuthEnabled,
    devResetEnabled: config.devResetEnabled,
    integrations: config.integrations,
    blockers
  };
}

function filterCatalogue(db, query) {
  const q = (query.get("q") || "").toLowerCase();
  const categoryId = query.get("categoryId");
  const offers = Object.fromEntries(db.sellerProducts.filter((offer) => offer.active).map((offer) => [offer.productId, offer]));
  return db.products
    .filter((product) => !categoryId || product.categoryId === categoryId)
    .filter((product) => {
      if (!q) return true;
      const haystack = [product.name, product.categoryId, product.subcategory, product.hsn, ...(product.aliases || [])].join(" ").toLowerCase();
      return haystack.includes(q);
    })
    .map((product) => enrichProduct(db, product, offers[product.id]));
}

function createOrder(db, body) {
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) throw new Error("Cart is empty");
  const products = productMap(db);
  const orderId = id("ORD");
  const grouped = {};
  let total = 0;
  for (const item of items) {
    const offer = db.sellerProducts.find((entry) => entry.productId === item.productId && entry.active);
    const product = products[item.productId];
    if (!offer || !product) throw new Error(`Product unavailable: ${item.productId}`);
    const qty = Math.max(1, Number(item.qty || 1));
    grouped[offer.sellerId] ||= [];
    grouped[offer.sellerId].push({ productId: product.id, name: product.name, qty, price: offer.price, hsn: product.hsn });
    total += offer.price * qty;
    offer.qty = Math.max(0, offer.qty - qty);
  }
  const subOrders = Object.entries(grouped).map(([sellerId, subItems], index) => ({
    id: `${orderId}-${index + 1}`,
    sellerId,
    status: "Placed",
    invoiceNumber: "",
    invoiceMode: "",
    refundState: "",
    rejectReason: "",
    timeline: [{ status: "Placed", at: "Just now" }],
    items: subItems
  }));
  const order = {
    id: orderId,
    customerId: CUSTOMER_ID,
    addressId: body.addressId || "addr-home",
    paymentMethod: body.paymentMethod || "upi",
    paymentState: body.paymentMethod === "cod" ? "COD" : "Paid",
    status: "Placed",
    total,
    createdAt: "Just now",
    subOrders
  };
  db.orders.unshift(order);
  const reward = db.settings.rewards;
  if (reward.enabled) {
    db.customerProfiles[CUSTOMER_ID].rewardPoints += Math.floor(total / reward.earnRs) * reward.points;
  }
  return order;
}

function updateSubOrder(db, subOrderId, body) {
  for (const order of db.orders) {
    const subOrder = order.subOrders.find((entry) => entry.id === subOrderId);
    if (!subOrder) continue;
    const profile = db.sellerProfiles[subOrder.sellerId];
    if (body.action === "confirm") {
      if (profile.autoInvoice) {
        subOrder.status = "Bag Packed";
        subOrder.invoiceNumber = subOrder.invoiceNumber || generateInvoice(subOrder.id);
        subOrder.invoiceMode = "Auto";
        subOrder.timeline.push({ status: `Auto invoice ${subOrder.invoiceNumber}`, at: "Just now" });
      } else {
        subOrder.status = "Invoice Required";
      }
    }
    if (body.action === "addInvoice") {
      subOrder.invoiceNumber = body.invoiceNumber || generateInvoice(subOrder.id);
      subOrder.invoiceMode = "Manual";
      subOrder.status = "Bag Packed";
    }
    if (body.action === "packed") subOrder.status = "Bag Packed";
    if (body.action === "handover") subOrder.status = "Handed Over";
    if (body.action === "delivered") subOrder.status = "Delivered";
    if (body.action === "reject") {
      subOrder.status = "Rejected";
      subOrder.rejectReason = body.reason || "No reason added";
      subOrder.refundState = order.paymentState === "Paid" ? "Refund Pending" : "Not applicable";
    }
    subOrder.timeline.push({ status: subOrder.status, at: "Just now" });
    return subOrder;
  }
  throw new Error("Sub-order not found");
}

async function handleApi(req, res, url) {
  const db = loadDb();
  const parts = url.pathname.split("/").filter(Boolean);
  const method = req.method;
  let body = {};
  if (!["GET", "HEAD"].includes(method)) body = await readBody(req);

  if (method === "GET" && url.pathname === "/api/health") return ok(res, { status: "ok", env: config.env, version: db.version });
  if (method === "GET" && url.pathname === "/api/ready") return ok(res, readiness(db));
  if (method === "GET" && url.pathname === "/api/openapi.json") return ok(res, openApiSpec(config));
  if (method === "POST" && url.pathname === "/api/dev/reset") {
    if (!config.devResetEnabled) return fail(res, 403, "Dev reset is disabled");
    return ok(res, resetDb());
  }

  if (method === "POST" && url.pathname === "/api/auth/otp/start") {
    if (!config.demoAuthEnabled) return fail(res, 501, "Real OTP provider is not wired yet");
    return ok(res, { requestId: id("OTP"), otp: "123456" });
  }
  if (method === "POST" && url.pathname === "/api/auth/otp/verify") {
    if (!config.demoAuthEnabled) return fail(res, 501, "Real OTP provider is not wired yet");
    return ok(res, { token: `demo-${body.role || "customer"}`, user: db.users.find((user) => user.role === (body.role || "customer")) });
  }

  if (method === "GET" && url.pathname === "/api/catalogue/categories") return ok(res, db.categories);
  if (method === "GET" && url.pathname === "/api/catalogue/products") return ok(res, filterCatalogue(db, url.searchParams));
  if (method === "GET" && url.pathname === "/api/settings") return ok(res, db.settings);

  if (method === "GET" && url.pathname === "/api/customer/home") return ok(res, { categories: db.categories, products: filterCatalogue(db, url.searchParams).slice(0, 16), notifications: db.notifications.filter((item) => ["customer", "all"].includes(item.audience)) });
  if (method === "GET" && url.pathname === "/api/customer/profile") return ok(res, db.customerProfiles[CUSTOMER_ID]);
  if (method === "GET" && url.pathname === "/api/customer/addresses") return ok(res, db.customerProfiles[CUSTOMER_ID].addresses);
  if (method === "POST" && url.pathname === "/api/customer/addresses") {
    const address = { id: id("ADDR"), type: body.type || "Other", label: body.label || "Saved address", line: body.line || "", lat: Number(body.lat || 0), lng: Number(body.lng || 0) };
    db.customerProfiles[CUSTOMER_ID].addresses.push(address);
    saveDb(db);
    return ok(res, address);
  }
  if (parts[0] === "api" && parts[1] === "customer" && parts[2] === "addresses" && parts[3]) {
    const addresses = db.customerProfiles[CUSTOMER_ID].addresses;
    const index = addresses.findIndex((address) => address.id === parts[3]);
    if (index < 0) return fail(res, 404, "Address not found");
    if (method === "PUT") addresses[index] = { ...addresses[index], ...body };
    if (method === "DELETE") addresses.splice(index, 1);
    saveDb(db);
    return ok(res, method === "DELETE" ? { deleted: true } : addresses[index]);
  }
  if (method === "POST" && url.pathname === "/api/customer/orders") {
    const order = createOrder(db, body);
    saveDb(db);
    return ok(res, order);
  }
  if (method === "GET" && url.pathname === "/api/customer/orders") return ok(res, db.orders.filter((order) => order.customerId === CUSTOMER_ID));

  if (method === "GET" && url.pathname === "/api/seller/profile") return ok(res, db.sellerProfiles[SELLER_ID]);
  if (method === "PUT" && url.pathname === "/api/seller/profile") {
    db.sellerProfiles[SELLER_ID] = { ...db.sellerProfiles[SELLER_ID], ...body };
    saveDb(db);
    return ok(res, db.sellerProfiles[SELLER_ID]);
  }
  if (method === "GET" && url.pathname === "/api/seller/products") {
    const products = productMap(db);
    return ok(res, db.sellerProducts.filter((offer) => offer.sellerId === SELLER_ID).map((offer) => enrichProduct(db, products[offer.productId], offer)));
  }
  if (method === "POST" && url.pathname === "/api/seller/products") {
    const offer = { id: id("SP"), sellerId: SELLER_ID, productId: body.productId, price: Number(body.price || 0), qty: Number(body.qty || 0), active: body.active !== false, tags: body.tags || ["Quick Delivery"], slaOverride: body.slaOverride || "" };
    db.sellerProducts.push(offer);
    saveDb(db);
    return ok(res, offer);
  }
  if (parts[0] === "api" && parts[1] === "seller" && parts[2] === "products" && parts[3] && method === "PATCH") {
    const offer = db.sellerProducts.find((entry) => entry.id === parts[3] || entry.productId === parts[3]);
    if (!offer) return fail(res, 404, "Seller product not found");
    Object.assign(offer, body);
    saveDb(db);
    return ok(res, offer);
  }
  if (method === "GET" && url.pathname === "/api/seller/catalogue") {
    const profile = db.sellerProfiles[SELLER_ID];
    const products = db.products.filter((product) => profile.selectedCategoryIds.includes(product.categoryId)).map((product) => enrichProduct(db, product));
    return ok(res, products);
  }
  if (method === "GET" && url.pathname === "/api/seller/orders") {
    return ok(res, db.orders.flatMap((order) => order.subOrders.filter((sub) => sub.sellerId === SELLER_ID).map((sub) => ({ ...sub, parentOrderId: order.id, paymentState: order.paymentState, sla: sellerSla(db.sellerProfiles[sub.sellerId]) }))));
  }
  if (parts[0] === "api" && parts[1] === "seller" && parts[2] === "orders" && parts[3] && method === "PATCH") {
    const subOrder = updateSubOrder(db, parts[3], body);
    saveDb(db);
    return ok(res, subOrder);
  }
  if (parts[0] === "api" && parts[1] === "seller" && parts[2] === "orders" && parts[3] && parts[4] === "print" && method === "GET") {
    const subOrder = db.orders.flatMap((order) => order.subOrders).find((entry) => entry.id === parts[3]);
    if (!subOrder) return fail(res, 404, "Sub-order not found");
    return send(res, 200, printableDocument(db, subOrder, url.searchParams.get("type") || "invoice", url.searchParams.get("format") || "A4"));
  }
  if (method === "POST" && url.pathname === "/api/seller/product-requests") {
    const request = { id: id("REQ"), sellerId: SELLER_ID, name: body.name, categoryId: body.categoryId, unit: body.unit, hsn: body.hsn || "", photoUrl: body.photoUrl || "", status: "Pending", reason: "", createdAt: "Just now" };
    db.productRequests.unshift(request);
    saveDb(db);
    return ok(res, request);
  }

  if (method === "GET" && url.pathname === "/api/admin/product-requests") return ok(res, db.productRequests);
  if (method === "GET" && url.pathname === "/api/admin/dashboard") return ok(res, adminDashboard(db));
  if (method === "GET" && url.pathname === "/api/admin/orders") {
    return ok(res, db.orders.map((order) => ({
      ...order,
      subOrders: order.subOrders.map((subOrder) => ({
        ...subOrder,
        seller: db.sellerProfiles[subOrder.sellerId]?.shopName || subOrder.sellerId,
        sla: sellerSla(db.sellerProfiles[subOrder.sellerId])
      }))
    })));
  }
  if (method === "GET" && url.pathname === "/api/admin/sellers") {
    return ok(res, Object.values(db.sellerProfiles).map((seller) => ({
      ...seller,
      liveProducts: db.sellerProducts.filter((product) => product.sellerId === seller.id && product.active).length,
      pendingRequests: db.productRequests.filter((request) => request.sellerId === seller.id && request.status === "Pending").length
    })));
  }
  if (parts[0] === "api" && parts[1] === "admin" && parts[2] === "product-requests" && parts[3] && method === "PATCH") {
    const request = db.productRequests.find((item) => item.id === parts[3]);
    if (!request) return fail(res, 404, "Request not found");
    request.status = body.status || request.status;
    request.reason = body.reason || "";
    if (request.status === "Approved") {
      const product = { id: request.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: request.name, categoryId: request.categoryId, subcategory: "Seller approved", unit: request.unit, hsn: request.hsn, gstRate: "As applicable", legalMetrology: { netQuantity: request.unit, origin: "India", consumerCare: "Bazaar Setu Support" }, imageText: request.name[0], imageColor: "#EEEDFE", mrp: Number(body.mrp || 99), aliases: [request.name.toLowerCase()] };
      if (!db.products.some((entry) => entry.id === product.id)) db.products.unshift(product);
    }
    saveDb(db);
    return ok(res, request);
  }
  if (method === "GET" && url.pathname === "/api/admin/settings") return ok(res, db.settings);
  if (method === "PUT" && url.pathname === "/api/admin/settings") {
    db.settings = { ...db.settings, ...body };
    saveDb(db);
    return ok(res, db.settings);
  }
  if (method === "GET" && url.pathname === "/api/admin/notifications") return ok(res, db.notifications);
  if (method === "GET" && url.pathname === "/api/notifications") {
    const audience = url.searchParams.get("audience") || "customer";
    return ok(res, db.notifications.filter((item) => [audience, "all"].includes(item.audience)));
  }
  if (method === "PATCH" && url.pathname === "/api/notifications/read") {
    const userId = body.userId || CUSTOMER_ID;
    db.notifications.forEach((item) => {
      if (!item.readBy.includes(userId)) item.readBy.push(userId);
    });
    saveDb(db);
    return ok(res, { read: true });
  }
  if (method === "POST" && url.pathname === "/api/admin/notifications") {
    const notification = { id: id("NTF"), audience: body.audience || "customer", type: body.type || "system", title: body.title || "Bazaar Setu update", body: body.body || "", readBy: [], createdAt: "Just now", source: "Admin" };
    db.notifications.unshift(notification);
    saveDb(db);
    return ok(res, notification);
  }

  return fail(res, 404, "API route not found", { method, path: url.pathname });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const startedAt = Date.now();
  if (req.method === "OPTIONS") return send(res, 204, "");
  try {
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res, url);
    if (serveStatic(req, res, url)) return;
    return fail(res, 404, "Not found");
  } catch (error) {
    return fail(res, 500, error.message);
  } finally {
    if (config.requestLogEnabled) {
      console.log(`${req.method} ${url.pathname} ${Date.now() - startedAt}ms`);
    }
  }
});

server.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});

server.listen(PORT, config.host, () => {
  console.log(`Bazaar Setu full-stack running at http://${config.host}:${PORT}`);
});
