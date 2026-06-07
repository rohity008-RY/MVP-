import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const serverDir = join(dist, "server");
const openAiDir = join(dist, ".openai");

const files = [
  ["/", "apps/landing/index.html"],
  ["/index.html", "apps/landing/index.html"],
  ["/customer", "apps/customer/index.html"],
  ["/customer/index.html", "apps/customer/index.html"],
  ["/customer/customer.css", "apps/customer/customer.css"],
  ["/customer/customer.js", "apps/customer/customer.js"],
  ["/customer/manifest.json", "apps/customer/manifest.json"],
  ["/seller", "apps/seller/index.html"],
  ["/seller/index.html", "apps/seller/index.html"],
  ["/seller/seller.js", "apps/seller/seller.js"],
  ["/seller/manifest.json", "apps/seller/manifest.json"],
  ["/admin", "apps/admin/index.html"],
  ["/admin/index.html", "apps/admin/index.html"],
  ["/admin/admin.js", "apps/admin/admin.js"],
  ["/admin/manifest.json", "apps/admin/manifest.json"],
  ["/shared/styles.css", "apps/shared/styles.css"],
  ["/shared/pwa.js", "apps/shared/pwa.js"],
  ["/shared/sw.js", "apps/shared/sw.js"],
  ["/mobile", "mobile/index.html"],
  ["/mobile/index.html", "mobile/index.html"],
  ["/mobile/app.js", "mobile/app.js"],
  ["/mobile/styles.css", "mobile/styles.css"],
  ["/mobile/manifest.json", "mobile/manifest.json"],
  ["/assets/bazaar-setu-logo.svg", "mobile/assets/bazaar-setu-logo.svg"]
];

function mime(path) {
  if (path.endsWith(".html") || path === "/" || !path.includes(".")) return "text/html; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (path.endsWith(".json")) return "application/json; charset=utf-8";
  if (path.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

const assets = Object.fromEntries(
  files.map(([publicPath, sourcePath]) => [
    publicPath,
    {
      body: readFileSync(join(root, sourcePath), "utf8"),
      type: mime(publicPath)
    }
  ])
);

const seedDb = JSON.parse(readFileSync(join(root, "backend/data/db.json"), "utf8"));

const worker = `const ASSETS = ${JSON.stringify(assets)};
const SEED_DB = ${JSON.stringify(seedDb)};
let db = JSON.parse(JSON.stringify(SEED_DB));
const CUSTOMER_ID = "customer-1";
const SELLER_ID = "seller-1";

function api(data, status = 200) {
  return new Response(JSON.stringify({ ok: status < 400, data }, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

function fail(message, status = 400, details = undefined) {
  return new Response(JSON.stringify({ ok: false, error: { message, details } }, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

async function bodyJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function id(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function productMap() {
  return Object.fromEntries(db.products.map((product) => [product.id, product]));
}

function categoryMap() {
  return Object.fromEntries(db.categories.map((category) => [category.id, category]));
}

function enrichProduct(product, offer = undefined) {
  const category = categoryMap()[product.categoryId];
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

function filterCatalogue(searchParams) {
  const q = (searchParams.get("q") || "").toLowerCase();
  const categoryId = searchParams.get("categoryId");
  const offers = Object.fromEntries(db.sellerProducts.filter((offer) => offer.active).map((offer) => [offer.productId, offer]));
  return db.products
    .filter((product) => !categoryId || product.categoryId === categoryId)
    .filter((product) => {
      if (!q) return true;
      const haystack = [product.name, product.categoryId, product.subcategory, product.hsn, ...(product.aliases || [])].join(" ").toLowerCase();
      return haystack.includes(q);
    })
    .map((product) => enrichProduct(product, offers[product.id]));
}

function sellerSla(profile) {
  const value = Math.max(1, Number(profile?.slaValue || 45));
  const unit = profile?.slaUnit || "min";
  const label = unit === "hrs" ? (value === 1 ? "hr" : "hrs") : unit === "day" ? (value === 1 ? "day" : "days") : "min";
  return value + " " + label;
}

function adminDashboard() {
  const sellerOrders = db.orders.flatMap((order) => order.subOrders);
  return {
    totals: {
      orders: db.orders.length,
      sellerSubOrders: sellerOrders.length,
      placed: sellerOrders.filter((order) => order.status === "Placed").length,
      packed: sellerOrders.filter((order) => order.status === "Bag Packed").length,
      rejected: sellerOrders.filter((order) => order.status === "Rejected").length,
      sellers: Object.keys(db.sellerProfiles).length,
      productRequests: db.productRequests.filter((request) => request.status === "Pending").length,
      notifications: db.notifications.length
    },
    paymentMethods: db.settings.paymentMethods,
    rewards: db.settings.rewards
  };
}

function createOrder(body) {
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) throw new Error("Cart is empty");
  const products = productMap();
  const orderId = id("ORD");
  const grouped = {};
  let total = 0;
  for (const item of items) {
    const offer = db.sellerProducts.find((entry) => entry.productId === item.productId && entry.active);
    const product = products[item.productId];
    if (!offer || !product) throw new Error("Product unavailable: " + item.productId);
    const qty = Math.max(1, Number(item.qty || 1));
    total += offer.price * qty;
    if (!grouped[offer.sellerId]) grouped[offer.sellerId] = [];
    grouped[offer.sellerId].push({ productId: product.id, name: product.name, hsn: product.hsn, unit: product.unit, qty, price: offer.price });
  }
  const subOrders = Object.entries(grouped).map(([sellerId, orderItems], index) => ({
    id: orderId + "-" + (index + 1),
    sellerId,
    status: "Placed",
    items: orderItems,
    invoiceNumber: "",
    invoiceMode: "",
    refundState: "Not applicable",
    timeline: [{ status: "Placed", at: "Just now" }]
  }));
  const order = {
    id: orderId,
    customerId: CUSTOMER_ID,
    addressId: body.addressId || db.customerProfiles[CUSTOMER_ID].addresses[0]?.id,
    status: "Placed",
    paymentMethod: body.paymentMethod || "upi",
    paymentState: body.paymentMethod === "cod" ? "COD" : "Paid",
    total,
    rewardPoints: Math.floor(total / Math.max(1, db.settings.rewards.earnRs || 100)) * (db.settings.rewards.points || 0),
    subOrders,
    createdAt: "Just now"
  };
  db.orders.unshift(order);
  db.customerProfiles[CUSTOMER_ID].rewardPoints = (db.customerProfiles[CUSTOMER_ID].rewardPoints || 0) + order.rewardPoints;
  return order;
}

function generateInvoice(orderId) {
  return "BS-" + orderId.replace(/\\D/g, "").slice(-4) + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

function updateSubOrder(orderId, body) {
  for (const order of db.orders) {
    const subOrder = order.subOrders.find((entry) => entry.id === orderId);
    if (!subOrder) continue;
    if (body.action === "confirm") {
      const seller = db.sellerProfiles[subOrder.sellerId];
      if (seller.autoInvoiceEnabled) {
        subOrder.status = "Bag Packed";
        subOrder.invoiceNumber = generateInvoice(subOrder.id);
        subOrder.invoiceMode = "auto";
      } else {
        subOrder.status = "Invoice Required";
      }
    }
    if (body.action === "addInvoice") {
      subOrder.status = "Bag Packed";
      subOrder.invoiceNumber = body.invoiceNumber || generateInvoice(subOrder.id);
      subOrder.invoiceMode = "manual";
    }
    if (body.action === "handover") subOrder.status = "Handed Over";
    if (body.action === "delivered") subOrder.status = "Delivered";
    if (body.action === "reject") {
      subOrder.status = "Rejected";
      subOrder.rejectReason = body.reason || "No reason added";
      subOrder.refundState = order.paymentState === "Paid" ? "Refund Pending" : "Not applicable";
    }
    subOrder.timeline.push({ status: subOrder.status, at: "Just now", note: body.reason || "" });
    return subOrder;
  }
  throw new Error("Sub-order not found");
}

function printableDocument(subOrder, type, format) {
  const seller = db.sellerProfiles[subOrder.sellerId];
  const rows = subOrder.items.map((item) => "<tr><td>" + item.name + "</td><td>" + (item.hsn || "Optional") + "</td><td>" + item.qty + "</td><td>Rs. " + item.price + "</td><td>Rs. " + item.price * item.qty + "</td></tr>").join("");
  return "<!doctype html><html><head><meta charset='utf-8'><title>" + type + " " + subOrder.id + "</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#111}.doc{max-width:" + (format === "80mm" ? "302px" : "760px") + ";border:1px solid #ddd;padding:18px}header{display:flex;gap:12px;align-items:center;border-bottom:2px solid #111;padding-bottom:12px}img{width:46px;height:46px}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #ddd;padding:8px;text-align:left}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.meta div{border:1px solid #ddd;padding:8px}</style></head><body><section class='doc'><header><img src='/assets/bazaar-setu-logo.svg' alt=''><div><h1>Bazaar Setu " + type + "</h1><p>" + format + "</p></div></header><div class='meta'><div><b>Shipment</b><br>" + subOrder.id + "</div><div><b>Seller</b><br>" + seller.shopName + "</div><div><b>FSSAI</b><br>" + seller.documents.fssai + "</div></div>" + (type === "label" ? "<h2>Delivery Label</h2><p>Customer address and delivery partner QR placeholder.</p>" : "<table><thead><tr><th>Item</th><th>HSN</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>" + rows + "</tbody></table>") + "<p>Support: support@bazaarsetu.example</p></section></body></html>";
}

function routeApi(request, url) {
  const method = request.method;
  const parts = url.pathname.split("/").filter(Boolean);
  return bodyJson(request).then((body) => {
    try {
      if (method === "GET" && url.pathname === "/api/health") return api({ status: "ok", env: "preview", version: db.version });
      if (method === "GET" && url.pathname === "/api/ready") return api({ status: "preview", env: "sites", apps: { customer: "/customer", seller: "/seller", adminSupport: "/admin" }, blockers: ["Preview uses embedded demo data."] });
      if (method === "GET" && url.pathname === "/api/openapi.json") return api({ openapi: "3.0.0", info: { title: "Bazaar Setu Preview API", version: "0.1.0" } });
      if (method === "POST" && url.pathname === "/api/dev/reset") { db = JSON.parse(JSON.stringify(SEED_DB)); return api(db); }
      if (method === "POST" && url.pathname === "/api/auth/otp/start") return api({ requestId: id("OTP"), otp: "123456" });
      if (method === "POST" && url.pathname === "/api/auth/otp/verify") return api({ token: "demo-" + (body.role || "customer"), user: db.users.find((user) => user.role === (body.role || "customer")) });
      if (method === "GET" && url.pathname === "/api/catalogue/categories") return api(db.categories);
      if (method === "GET" && url.pathname === "/api/catalogue/products") return api(filterCatalogue(url.searchParams));
      if (method === "GET" && url.pathname === "/api/settings") return api(db.settings);
      if (method === "GET" && url.pathname === "/api/customer/home") return api({ categories: db.categories, products: filterCatalogue(url.searchParams).slice(0, 16), notifications: db.notifications.filter((item) => ["customer", "all"].includes(item.audience)) });
      if (method === "GET" && url.pathname === "/api/customer/profile") return api(db.customerProfiles[CUSTOMER_ID]);
      if (method === "GET" && url.pathname === "/api/customer/addresses") return api(db.customerProfiles[CUSTOMER_ID].addresses);
      if (method === "POST" && url.pathname === "/api/customer/addresses") {
        const address = { id: id("ADDR"), type: body.type || "Other", label: body.label || "Saved address", line: body.line || "", lat: Number(body.lat || 0), lng: Number(body.lng || 0) };
        db.customerProfiles[CUSTOMER_ID].addresses.push(address);
        return api(address);
      }
      if (parts[0] === "api" && parts[1] === "customer" && parts[2] === "addresses" && parts[3]) {
        const addresses = db.customerProfiles[CUSTOMER_ID].addresses;
        const index = addresses.findIndex((address) => address.id === parts[3]);
        if (index < 0) return fail("Address not found", 404);
        if (method === "PUT") addresses[index] = { ...addresses[index], ...body };
        if (method === "DELETE") addresses.splice(index, 1);
        return api(method === "DELETE" ? { deleted: true } : addresses[index]);
      }
      if (method === "POST" && url.pathname === "/api/customer/orders") return api(createOrder(body));
      if (method === "GET" && url.pathname === "/api/customer/orders") return api(db.orders.filter((order) => order.customerId === CUSTOMER_ID));
      if (method === "GET" && url.pathname === "/api/seller/profile") return api(db.sellerProfiles[SELLER_ID]);
      if (method === "PUT" && url.pathname === "/api/seller/profile") { db.sellerProfiles[SELLER_ID] = { ...db.sellerProfiles[SELLER_ID], ...body }; return api(db.sellerProfiles[SELLER_ID]); }
      if (method === "GET" && url.pathname === "/api/seller/products") {
        const products = productMap();
        return api(db.sellerProducts.filter((offer) => offer.sellerId === SELLER_ID).map((offer) => enrichProduct(products[offer.productId], offer)));
      }
      if (method === "POST" && url.pathname === "/api/seller/products") {
        const offer = { id: id("SP"), sellerId: SELLER_ID, productId: body.productId, price: Number(body.price || 0), qty: Number(body.qty || 0), active: body.active !== false, tags: body.tags || ["Quick Delivery"], slaOverride: body.slaOverride || "" };
        db.sellerProducts.push(offer);
        return api(offer);
      }
      if (parts[0] === "api" && parts[1] === "seller" && parts[2] === "products" && parts[3] && method === "PATCH") {
        const offer = db.sellerProducts.find((entry) => entry.id === parts[3] || entry.productId === parts[3]);
        if (!offer) return fail("Seller product not found", 404);
        Object.assign(offer, body);
        return api(offer);
      }
      if (method === "GET" && url.pathname === "/api/seller/catalogue") {
        const profile = db.sellerProfiles[SELLER_ID];
        return api(db.products.filter((product) => profile.selectedCategoryIds.includes(product.categoryId)).map((product) => enrichProduct(product)));
      }
      if (method === "GET" && url.pathname === "/api/seller/orders") return api(db.orders.flatMap((order) => order.subOrders.filter((sub) => sub.sellerId === SELLER_ID).map((sub) => ({ ...sub, parentOrderId: order.id, paymentState: order.paymentState, sla: sellerSla(db.sellerProfiles[sub.sellerId]) }))));
      if (parts[0] === "api" && parts[1] === "seller" && parts[2] === "orders" && parts[3] && method === "PATCH") return api(updateSubOrder(parts[3], body));
      if (parts[0] === "api" && parts[1] === "seller" && parts[2] === "orders" && parts[3] && parts[4] === "print" && method === "GET") {
        const subOrder = db.orders.flatMap((order) => order.subOrders).find((entry) => entry.id === parts[3]);
        if (!subOrder) return fail("Sub-order not found", 404);
        return new Response(printableDocument(subOrder, url.searchParams.get("type") || "invoice", url.searchParams.get("format") || "A4"), { headers: { "content-type": "text/html; charset=utf-8" } });
      }
      if (method === "POST" && url.pathname === "/api/seller/product-requests") {
        const request = { id: id("REQ"), sellerId: SELLER_ID, name: body.name, categoryId: body.categoryId, unit: body.unit, hsn: body.hsn || "", photoUrl: body.photoUrl || "", status: "Pending", reason: "", createdAt: "Just now" };
        db.productRequests.unshift(request);
        return api(request);
      }
      if (method === "GET" && url.pathname === "/api/admin/product-requests") return api(db.productRequests);
      if (method === "GET" && url.pathname === "/api/admin/dashboard") return api(adminDashboard());
      if (method === "GET" && url.pathname === "/api/admin/orders") return api(db.orders.map((order) => ({ ...order, subOrders: order.subOrders.map((subOrder) => ({ ...subOrder, seller: db.sellerProfiles[subOrder.sellerId]?.shopName || subOrder.sellerId, sla: sellerSla(db.sellerProfiles[subOrder.sellerId]) })) })));
      if (method === "GET" && url.pathname === "/api/admin/sellers") return api(Object.values(db.sellerProfiles).map((seller) => ({ ...seller, liveProducts: db.sellerProducts.filter((product) => product.sellerId === seller.id && product.active).length, pendingRequests: db.productRequests.filter((request) => request.sellerId === seller.id && request.status === "Pending").length })));
      if (parts[0] === "api" && parts[1] === "admin" && parts[2] === "product-requests" && parts[3] && method === "PATCH") {
        const requestEntry = db.productRequests.find((item) => item.id === parts[3]);
        if (!requestEntry) return fail("Request not found", 404);
        requestEntry.status = body.status || requestEntry.status;
        requestEntry.reason = body.reason || "";
        if (requestEntry.status === "Approved") {
          const product = { id: requestEntry.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: requestEntry.name, categoryId: requestEntry.categoryId, subcategory: "Seller approved", unit: requestEntry.unit, hsn: requestEntry.hsn, gstRate: "As applicable", legalMetrology: { netQuantity: requestEntry.unit, origin: "India", consumerCare: "Bazaar Setu Support" }, imageText: requestEntry.name[0], imageColor: "#EEEDFE", mrp: Number(body.mrp || 99), aliases: [requestEntry.name.toLowerCase()] };
          if (!db.products.some((entry) => entry.id === product.id)) db.products.unshift(product);
        }
        return api(requestEntry);
      }
      if (method === "GET" && url.pathname === "/api/admin/settings") return api(db.settings);
      if (method === "PUT" && url.pathname === "/api/admin/settings") { db.settings = { ...db.settings, ...body }; return api(db.settings); }
      if (method === "GET" && url.pathname === "/api/admin/notifications") return api(db.notifications);
      if (method === "GET" && url.pathname === "/api/notifications") {
        const audience = url.searchParams.get("audience") || "customer";
        return api(db.notifications.filter((item) => [audience, "all"].includes(item.audience)));
      }
      if (method === "PATCH" && url.pathname === "/api/notifications/read") {
        const userId = body.userId || CUSTOMER_ID;
        db.notifications.forEach((item) => { if (!item.readBy.includes(userId)) item.readBy.push(userId); });
        return api({ read: true });
      }
      if (method === "POST" && url.pathname === "/api/admin/notifications") {
        const notification = { id: id("NTF"), audience: body.audience || "customer", type: body.type || "system", title: body.title || "Bazaar Setu update", body: body.body || "", readBy: [], createdAt: "Just now", source: "Admin" };
        db.notifications.unshift(notification);
        return api(notification);
      }
      return fail("API route not found", 404, { method, path: url.pathname });
    } catch (error) {
      return fail(error.message || "Preview error", 500);
    }
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return routeApi(request, url);
    const key = ASSETS[url.pathname] ? url.pathname : (url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname);
    const asset = ASSETS[key] || ASSETS[key + "/index.html"] || ASSETS["/"];
    return new Response(asset.body, { headers: { "content-type": asset.type, "cache-control": asset.type.includes("html") ? "no-store" : "public, max-age=3600" } });
  }
};
`;

rmSync(dist, { recursive: true, force: true });
mkdirSync(serverDir, { recursive: true });
mkdirSync(openAiDir, { recursive: true });
writeFileSync(join(serverDir, "index.js"), worker);

try {
  const hosting = readFileSync(join(root, ".openai/hosting.json"), "utf8");
  writeFileSync(join(openAiDir, "hosting.json"), hosting);
} catch {
  writeFileSync(join(openAiDir, "hosting.json"), JSON.stringify({ project_id: "" }, null, 2));
}

console.log("Built Sites worker at", relative(process.cwd(), join(serverDir, "index.js")));
