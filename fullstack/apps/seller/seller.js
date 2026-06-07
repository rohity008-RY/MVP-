const api = {
  async get(path) {
    const res = await fetch(path);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error.message);
    return json.data;
  },
  async send(path, method, body) {
    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error.message);
    return json.data;
  }
};

const state = {
  profile: null,
  categories: [],
  catalogue: [],
  products: [],
  orders: [],
  notifications: [],
  productTab: "catalogue",
  orderLane: "All"
};

const lanes = ["All", "Placed", "Invoice Required", "Bag Packed", "Handed Over", "Delivered", "Rejected"];
const $ = (selector) => document.querySelector(selector);

function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  setTimeout(() => node.classList.remove("show"), 1800);
}

function money(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
}

function setScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.toggle("active", screen.id === screenId));
  document.querySelectorAll("[data-seller-view]").forEach((button) => button.classList.toggle("active", button.dataset.sellerView === screenId));
  if (screenId === "sellerOrders") renderOrders();
  if (screenId === "sellerProducts") renderProducts();
  if (screenId === "sellerProfile") renderProfile();
  if (screenId === "sellerNotifications") renderNotifications();
}

async function loadSeller() {
  const [profile, categories, catalogue, products, orders, notifications] = await Promise.all([
    api.get("/api/seller/profile"),
    api.get("/api/catalogue/categories"),
    api.get("/api/seller/catalogue"),
    api.get("/api/seller/products"),
    api.get("/api/seller/orders"),
    api.get("/api/notifications?audience=seller")
  ]);
  state.profile = profile;
  state.categories = categories;
  state.catalogue = catalogue;
  state.products = products;
  state.orders = orders;
  state.notifications = notifications;
  renderAll();
}

function renderAll() {
  renderHome();
  renderOrders();
  renderProducts();
  renderProfile();
  renderNotifications();
}

function renderHome() {
  const profile = state.profile;
  $("#sellerHeroTitle").textContent = profile.shopName;
  $("#sellerHeroMeta").textContent = `${profile.address} · ${profile.storeStart}-${profile.storeEnd} · SLA ${profile.slaValue} ${profile.slaUnit}`;
  $("#sellerStatusCard").innerHTML = `
    <span class="pill ${profile.storeLive ? "" : "red"}">${profile.storeLive ? "Store live on platform" : "Store disabled"}</span>
    <h2>${profile.ownerName}</h2>
    <div class="line"><span>Auto invoicing</span><strong>${profile.autoInvoice ? "Enabled" : "Manual"}</strong></div>
    <div class="line"><span>Delivery fee</span><strong>${money(profile.deliveryFee)}</strong></div>
    <div class="line"><span>Live products</span><strong>${state.products.filter((product) => product.active).length}</strong></div>
    <button class="${profile.storeLive ? "danger" : "primary"}" id="toggleStoreButton" type="button">${profile.storeLive ? "Disable store" : "Enable store"}</button>
  `;
  const placedCount = state.orders.filter((order) => order.status === "Placed").length;
  $("#sellerActionCard").innerHTML = `
    <h2>Today action centre</h2>
    <div class="line"><span>New orders to confirm</span><strong>${placedCount}</strong></div>
    <div class="line"><span>Bag packed lane</span><strong>${state.orders.filter((order) => order.status === "Bag Packed").length}</strong></div>
    <button class="secondary" data-seller-view="sellerOrders" type="button">Open orders</button>
  `;
}

function renderOrders() {
  $("#sellerOrderLanes").innerHTML = lanes.map((lane) => `
    <button class="chip ${state.orderLane === lane ? "active" : ""}" data-order-lane="${lane}" type="button">${lane}</button>
  `).join("");
  const filtered = state.orderLane === "All" ? state.orders : state.orders.filter((order) => order.status === state.orderLane);
  $("#sellerOrderList").innerHTML = filtered.length ? filtered.map((order) => `
    <article class="order-card">
      <div class="line">
        <span><strong>${order.id}</strong><br><small>${order.parentOrderId} · ${order.paymentState} · SLA ${order.sla}</small></span>
        <span class="pill ${order.status === "Rejected" ? "red" : order.status === "Placed" ? "orange" : ""}">${order.status}</span>
      </div>
      ${order.items.map((item) => `<small>${item.name} x ${item.qty} · HSN ${item.hsn || "Optional"} · ${money(item.price)}</small>`).join("")}
      ${order.invoiceNumber ? `<small>Invoice: ${order.invoiceNumber} (${order.invoiceMode})</small>` : ""}
      ${order.rejectReason ? `<small>Reject note: ${order.rejectReason}</small>` : ""}
      <div class="price-row">${orderActionButtons(order)}</div>
    </article>
  `).join("") : `<section class="card"><h2>No orders in this lane</h2><p class="muted">Orders will appear when customers place them.</p></section>`;
}

function orderActionButtons(order) {
  if (order.status === "Placed") {
    return `
      <button class="primary" data-confirm-order="${order.id}" type="button">Confirm</button>
      <button class="danger" data-reject-order="${order.id}" type="button">Reject</button>
    `;
  }
  if (order.status === "Invoice Required") {
    return `<button class="primary" data-add-invoice="${order.id}" type="button">Add invoice</button>`;
  }
  if (order.status === "Bag Packed") {
    return `
      <button class="ghost" data-print-invoice="${order.id}" type="button">Print invoice</button>
      <button class="ghost" data-print-label="${order.id}" type="button">Print label</button>
      <button class="secondary" data-handover-order="${order.id}" type="button">Handover</button>
    `;
  }
  if (order.status === "Handed Over") {
    return `<button class="primary" data-deliver-order="${order.id}" type="button">Mark delivered</button>`;
  }
  return `<span class="muted">No seller action required</span>`;
}

function renderProducts() {
  document.querySelectorAll("[data-product-tab]").forEach((button) => button.classList.toggle("active", button.dataset.productTab === state.productTab));
  const liveIds = new Set(state.products.map((product) => product.id));
  if (state.productTab === "catalogue") {
    $("#sellerProductContent").innerHTML = `
      <section class="card">
        <h2>Products from selected categories</h2>
        ${state.catalogue.map((product) => `
          <div class="line">
            <span><b>${product.name}</b><br><small>${product.categoryName} · ${product.unit} · HSN ${product.hsn || "Optional"}</small></span>
            ${liveIds.has(product.id) ? `<span class="pill">Added</span>` : `<button class="primary" data-make-live="${product.id}" type="button">Add</button>`}
          </div>
        `).join("")}
      </section>
    `;
  }
  if (state.productTab === "myProducts") {
    $("#sellerProductContent").innerHTML = `
      <section class="card">
        <h2>My Live Products</h2>
        ${state.products.map((product) => `
          <div class="line">
            <span><b>${product.name}</b><br><small>${product.unit} · ${money(product.price)} · Qty ${product.qty} · HSN ${product.hsn || "Optional"}</small></span>
            <span class="pill ${product.active ? "" : "red"}">${product.active ? "Live" : "Off"}</span>
          </div>
        `).join("") || `<p class="muted">Add products from catalogue to go live.</p>`}
      </section>
    `;
  }
  if (state.productTab === "inventory") {
    $("#sellerProductContent").innerHTML = `
      <section class="card">
        <h2>Inventory</h2>
        ${state.products.map((product) => `
          <div class="line">
            <span><b>${product.name}</b><br><small>${money(product.price)} · Qty ${product.qty}</small></span>
            <span>
              <button class="ghost" data-update-price="${product.sellerProductId}" type="button">Price</button>
              <button class="primary" data-add-stock="${product.sellerProductId}" type="button">+ Stock</button>
            </span>
          </div>
        `).join("") || `<p class="muted">No inventory yet.</p>`}
      </section>
    `;
  }
  if (state.productTab === "request") {
    $("#sellerProductContent").innerHTML = `
      <section class="card">
        <h2>Add New Product Request</h2>
        <p class="muted">Photo capture and AI extraction are mocked for this prototype.</p>
        <div class="form-grid">
          <label>Product name<input id="requestName" value="Homemade Lemon Pickle"></label>
          <label>Category
            <select id="requestCategory">${state.categories.map((category) => `<option value="${category.id}">${category.name}</option>`).join("")}</select>
          </label>
          <label>Unit<input id="requestUnit" value="250 g jar"></label>
          <label>Optional HSN<input id="requestHsn" value="2106"></label>
          <button class="ghost" id="mockAiExtractButton" type="button">Mock AI extract details</button>
          <button class="primary" id="submitProductRequestButton" type="button">Submit to Admin</button>
        </div>
      </section>
    `;
  }
}

function renderProfile() {
  const profile = state.profile;
  const selected = new Set(profile.selectedCategoryIds || []);
  $("#sellerProfileForm").innerHTML = `
    <h2>Profile & Operations</h2>
    <div class="form-grid">
      <label>Owner name<input id="ownerName" value="${profile.ownerName}"></label>
      <label>Shop name<input id="shopName" value="${profile.shopName}"></label>
      <label>Phone<input id="sellerPhone" value="${profile.phone}"></label>
      <label>Email<input id="sellerEmail" value="${profile.email || ""}"></label>
      <label>Address<input id="sellerAddress" value="${profile.address}"></label>
      <label>Store start<input id="storeStart" type="time" value="${profile.storeStart}"></label>
      <label>Store end<input id="storeEnd" type="time" value="${profile.storeEnd}"></label>
      <label>Delivery SLA value<input id="slaValue" type="number" min="1" value="${profile.slaValue}"></label>
      <label>Delivery SLA unit
        <select id="slaUnit">
          <option value="min">Minutes</option>
          <option value="hrs">Hours</option>
          <option value="day">Days</option>
        </select>
      </label>
      <label>Delivery fee<input id="deliveryFee" type="number" value="${profile.deliveryFee || 0}"></label>
      <label>Auto invoicing
        <select id="autoInvoice">
          <option value="true">Enabled</option>
          <option value="false">Manual invoice number</option>
        </select>
      </label>
      <label>FSSAI<input id="fssai" value="${profile.documents?.fssai || ""}"></label>
      <label>GSTIN<input id="gstin" value="${profile.documents?.gstin || ""}"></label>
      <label>PAN<input id="pan" value="${profile.documents?.pan || ""}"></label>
      <label>Bank<input id="bank" value="${profile.documents?.bank || ""}"></label>
      <label>UPI<input id="upi" value="${profile.documents?.upi || ""}"></label>
    </div>
    <h2>Onboarding Categories</h2>
    <div class="chip-row" style="padding:0">
      ${state.categories.map((category) => `<button class="chip ${selected.has(category.id) ? "active" : ""}" data-profile-category="${category.id}" type="button">${category.name}</button>`).join("")}
    </div>
    <button class="primary" id="saveSellerProfileButton" type="button">Save profile</button>
  `;
  $("#slaUnit").value = profile.slaUnit;
  $("#autoInvoice").value = String(Boolean(profile.autoInvoice));
}

function renderNotifications() {
  const unread = state.notifications.filter((item) => !(item.readBy || []).includes("seller-1")).length;
  $("#sellerNotificationCount").textContent = unread ? String(unread) : "";
  $("#sellerNotificationList").innerHTML = `
    ${state.notifications.map((item) => `
      <article class="notification-card">
        <div class="line">
          <span><strong>${item.title}</strong><br><small>${item.type} · ${item.createdAt}</small></span>
          <span class="pill">${item.source}</span>
        </div>
        <p class="muted">${item.body}</p>
      </article>
    `).join("") || `<section class="card"><h2>No notifications</h2><p class="muted">Admin updates will appear here.</p></section>`}
    <section class="card"><button class="secondary" id="sellerMarkReadButton" type="button">Mark all as read</button></section>
  `;
}

async function makeLive(productId) {
  const product = state.catalogue.find((item) => item.id === productId);
  const price = Number(prompt(`Price for ${product.name}`, String(product.price || product.mrp || 99)) || 0);
  const qty = Number(prompt(`Opening quantity for ${product.name}`, "10") || 0);
  if (!price || !qty) {
    toast("Price and quantity are required");
    return;
  }
  await api.send("/api/seller/products", "POST", { productId, price, qty, active: true });
  toast("Product added to live inventory");
  await loadSeller();
}

async function updateOrder(orderId, action, payload = {}) {
  await api.send(`/api/seller/orders/${orderId}`, "PATCH", { action, ...payload });
  await loadSeller();
}

function openPrint(orderId, type) {
  const format = prompt("Select format: A4, A5, 4x6, 80mm", "A4") || "A4";
  window.open(`/api/seller/orders/${orderId}/print?type=${encodeURIComponent(type)}&format=${encodeURIComponent(format)}`, "_blank");
}

async function saveProfile() {
  const selectedCategoryIds = Array.from(document.querySelectorAll("[data-profile-category].active")).map((button) => button.dataset.profileCategory);
  await api.send("/api/seller/profile", "PUT", {
    ownerName: $("#ownerName").value,
    shopName: $("#shopName").value,
    phone: $("#sellerPhone").value,
    email: $("#sellerEmail").value,
    address: $("#sellerAddress").value,
    storeStart: $("#storeStart").value,
    storeEnd: $("#storeEnd").value,
    slaValue: Number($("#slaValue").value),
    slaUnit: $("#slaUnit").value,
    deliveryFee: Number($("#deliveryFee").value),
    autoInvoice: $("#autoInvoice").value === "true",
    selectedCategoryIds,
    documents: {
      fssai: $("#fssai").value,
      gstin: $("#gstin").value,
      pan: $("#pan").value,
      bank: $("#bank").value,
      upi: $("#upi").value
    }
  });
  toast("Seller profile saved");
  await loadSeller();
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  try {
    if (button.dataset.sellerView) setScreen(button.dataset.sellerView);
    if (button.id === "sellerNotificationButton") setScreen("sellerNotifications");
    if (button.id === "toggleStoreButton") {
      await api.send("/api/seller/profile", "PUT", { storeLive: !state.profile.storeLive });
      await loadSeller();
    }
    if (button.dataset.orderLane) {
      state.orderLane = button.dataset.orderLane;
      renderOrders();
    }
    if (button.dataset.confirmOrder) await updateOrder(button.dataset.confirmOrder, "confirm");
    if (button.dataset.rejectOrder) {
      const reason = prompt("Add rejection reason", "Out of stock");
      if (!reason) return;
      await updateOrder(button.dataset.rejectOrder, "reject", { reason });
    }
    if (button.dataset.addInvoice) {
      const invoiceNumber = prompt("Enter invoice number", `BS-${Date.now().toString().slice(-6)}`);
      if (!invoiceNumber) return;
      await updateOrder(button.dataset.addInvoice, "addInvoice", { invoiceNumber });
    }
    if (button.dataset.printInvoice) openPrint(button.dataset.printInvoice, "invoice");
    if (button.dataset.printLabel) openPrint(button.dataset.printLabel, "label");
    if (button.dataset.handoverOrder) await updateOrder(button.dataset.handoverOrder, "handover");
    if (button.dataset.deliverOrder) await updateOrder(button.dataset.deliverOrder, "delivered");
    if (button.dataset.productTab) {
      state.productTab = button.dataset.productTab;
      renderProducts();
    }
    if (button.dataset.makeLive) await makeLive(button.dataset.makeLive);
    if (button.dataset.addStock) {
      const product = state.products.find((item) => item.sellerProductId === button.dataset.addStock);
      const qty = Number(prompt("New quantity", String((product?.qty || 0) + 1)) || product?.qty || 0);
      await api.send(`/api/seller/products/${button.dataset.addStock}`, "PATCH", { qty });
      await loadSeller();
    }
    if (button.dataset.updatePrice) {
      const product = state.products.find((item) => item.sellerProductId === button.dataset.updatePrice);
      const price = Number(prompt("New price", String(product?.price || 99)) || product?.price || 99);
      await api.send(`/api/seller/products/${button.dataset.updatePrice}`, "PATCH", { price });
      await loadSeller();
    }
    if (button.id === "mockAiExtractButton") {
      $("#requestName").value = "AI Extracted Local Snack";
      $("#requestUnit").value = "200 g pack";
      $("#requestHsn").value = "2106";
      toast("AI details extracted");
    }
    if (button.id === "submitProductRequestButton") {
      await api.send("/api/seller/product-requests", "POST", {
        name: $("#requestName").value,
        categoryId: $("#requestCategory").value,
        unit: $("#requestUnit").value,
        hsn: $("#requestHsn").value
      });
      toast("Product request sent to Admin");
      await loadSeller();
    }
    if (button.dataset.profileCategory) {
      button.classList.toggle("active");
    }
    if (button.id === "saveSellerProfileButton") await saveProfile();
    if (button.id === "sellerMarkReadButton") {
      await api.send("/api/notifications/read", "PATCH", { userId: "seller-1" });
      await loadSeller();
    }
  } catch (error) {
    toast(error.message);
  }
});

loadSeller().catch((error) => toast(error.message));
