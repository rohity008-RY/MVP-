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
  role: "customer",
  sellerTab: "orders",
  categories: [],
  products: [],
  cart: {},
  addresses: [],
  customerOrders: [],
  notifications: [],
  sellerProfile: null,
  sellerOrders: [],
  sellerProducts: [],
  sellerCatalogue: [],
  adminRequests: [],
  adminNotifications: []
};

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

function cartCount() {
  return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
}

function cartLines() {
  return Object.entries(state.cart)
    .map(([productId, qty]) => ({ product: state.products.find((item) => item.id === productId), qty }))
    .filter((line) => line.product);
}

function cartTotal() {
  return cartLines().reduce((sum, line) => sum + line.product.price * line.qty, 0);
}

function setRole(role) {
  state.role = role;
  document.querySelectorAll("[data-role]").forEach((button) => button.classList.toggle("active", button.dataset.role === role));
  document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));
  $(`#${role}Panel`).classList.add("active");
  $("#modeSubtitle").textContent = `${role[0].toUpperCase()}${role.slice(1)} app`;
  refresh();
}

async function refresh() {
  if (state.role === "customer") await loadCustomer();
  if (state.role === "seller") await loadSeller();
  if (state.role === "admin") await loadAdmin();
}

async function loadCustomer() {
  const [home, addresses, orders, notifications] = await Promise.all([
    api.get(`/api/customer/home?q=${encodeURIComponent($("#searchInput").value || "")}`),
    api.get("/api/customer/addresses"),
    api.get("/api/customer/orders"),
    api.get("/api/notifications?audience=customer")
  ]);
  state.categories = home.categories;
  state.products = home.products;
  state.addresses = addresses;
  state.customerOrders = orders;
  state.notifications = notifications;
  renderCustomer();
}

function renderCustomer() {
  $("#notificationCount").textContent = state.notifications.filter((item) => !(item.readBy || []).includes("customer-1")).length || "";
  $("#cartCount").textContent = cartCount();
  $("#addressButton").textContent = state.addresses[0]?.label || "Add address";
  $("#categoryChips").innerHTML = [`<button class="active" type="button">All</button>`, ...state.categories.map((category) => `<button type="button" data-category="${category.id}">${category.name}</button>`)].join("");
  $("#productGrid").innerHTML = state.products
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-media" style="background:${product.imageColor}">${product.imageText}</div>
          <div>
            <strong>${product.name}</strong>
            <small>${product.unit} · HSN ${product.hsn || "Optional"}</small>
            <b>${money(product.price)}</b>
            <button type="button" data-add="${product.id}">Add</button>
          </div>
        </article>
      `
    )
    .join("");
  renderCart();
  renderAddresses();
  renderCustomerOrders();
  renderNotifications();
}

function renderCart() {
  const lines = cartLines();
  $("#cartPanel").innerHTML = `
    <h2>Cart</h2>
    ${lines.length ? lines.map((line) => `<div class="line"><span>${line.product.name} x ${line.qty}</span><b>${money(line.product.price * line.qty)}</b></div>`).join("") : "<small>No items yet.</small>"}
    <div class="line"><strong>Total</strong><strong>${money(cartTotal())}</strong></div>
    <button class="primary" id="checkoutButton" type="button" ${lines.length ? "" : "disabled"}>Checkout</button>
  `;
}

function renderAddresses() {
  $("#addressPanel").innerHTML = `
    <h2>Saved Addresses</h2>
    ${state.addresses
      .map((address) => `<div class="line"><span><b>${address.type}</b><br>${address.label}<br><small>${address.line}</small></span><button data-delete-address="${address.id}" type="button">Remove</button></div>`)
      .join("")}
    <button class="ghost" id="addAddress" type="button">Add sample address</button>
  `;
}

function renderCustomerOrders() {
  $("#customerOrders").innerHTML = `
    <h2>Orders</h2>
    ${state.customerOrders.map((order) => `<article class="order-card"><strong>${order.id}</strong><small>${order.status} · ${money(order.total)} · ${order.paymentState}</small></article>`).join("") || "<small>No orders yet.</small>"}
  `;
}

function renderNotifications() {
  $("#customerNotifications").innerHTML = `
    <h2>Notifications</h2>
    ${state.notifications
      .map((item) => `<article class="notification ${(item.readBy || []).includes("customer-1") ? "" : "unread"}"><strong>${item.title}</strong><small>${item.type} · ${item.createdAt}</small><p>${item.body}</p></article>`)
      .join("")}
    <button class="ghost" id="markRead" type="button">Mark all read</button>
  `;
}

async function loadSeller() {
  const [profile, orders, products, catalogue] = await Promise.all([
    api.get("/api/seller/profile"),
    api.get("/api/seller/orders"),
    api.get("/api/seller/products"),
    api.get("/api/seller/catalogue")
  ]);
  state.sellerProfile = profile;
  state.sellerOrders = orders;
  state.sellerProducts = products;
  state.sellerCatalogue = catalogue;
  renderSeller();
}

function renderSeller() {
  const profile = state.sellerProfile;
  $("#sellerProfileCard").innerHTML = `
    <span class="pill ${profile.storeLive ? "" : "red"}">${profile.storeLive ? "Store live" : "Store disabled"}</span>
    <h2>${profile.shopName}</h2>
    <small>${profile.address} · SLA ${profile.slaValue} ${profile.slaUnit} · ${profile.storeStart}-${profile.storeEnd}</small>
    <button id="toggleStore" type="button">${profile.storeLive ? "Disable store" : "Enable store"}</button>
  `;
  document.querySelectorAll("[data-seller-tab]").forEach((button) => button.classList.toggle("active", button.dataset.sellerTab === state.sellerTab));
  const content = $("#sellerContent");
  if (state.sellerTab === "orders") {
    content.innerHTML = `<section class="card"><h2>Orders</h2>${state.sellerOrders
      .map((order) => `<article class="order-card"><strong>${order.id}</strong><small>${order.status} · SLA ${order.sla}</small><div><button data-confirm="${order.id}" type="button">Confirm</button> <button data-reject="${order.id}" type="button">Reject</button></div></article>`)
      .join("")}</section>`;
  }
  if (state.sellerTab === "catalogue") {
    content.innerHTML = `<section class="card"><h2>Catalogue</h2>${state.sellerCatalogue
      .map((product) => `<div class="line"><span>${product.name}<br><small>${product.unit} · HSN ${product.hsn || "Optional"}</small></span><button data-live="${product.id}" type="button">Live</button></div>`)
      .join("")}</section>`;
  }
  if (state.sellerTab === "inventory") {
    content.innerHTML = `<section class="card"><h2>Inventory</h2>${state.sellerProducts
      .map((product) => `<div class="line"><span>${product.name}<br><small>${money(product.price)} · Qty ${product.qty}</small></span><button data-plus="${product.sellerProductId}" type="button">+ Stock</button></div>`)
      .join("")}</section>`;
  }
  if (state.sellerTab === "profile") {
    content.innerHTML = `
      <section class="card">
        <h2>Profile & SLA</h2>
        <label>Store start<input id="storeStart" type="time" value="${profile.storeStart}"></label>
        <label>Store end<input id="storeEnd" type="time" value="${profile.storeEnd}"></label>
        <label>SLA value<input id="slaValue" type="number" value="${profile.slaValue}"></label>
        <label>SLA unit<select id="slaUnit"><option value="min">Minutes</option><option value="hrs">Hours</option><option value="day">Days</option></select></label>
        <button class="primary" id="saveSellerProfile" type="button">Save profile</button>
      </section>
      <section class="card">
        <h2>Add New Product Request</h2>
        <label>Name<input id="requestName" placeholder="Homemade Lemon Pickle"></label>
        <label>Category<input id="requestCategory" value="packaged-food"></label>
        <label>Unit<input id="requestUnit" value="250 g jar"></label>
        <button class="primary" id="submitRequest" type="button">Submit request</button>
      </section>
    `;
    $("#slaUnit").value = profile.slaUnit;
  }
}

async function loadAdmin() {
  const [requests, notifications] = await Promise.all([
    api.get("/api/admin/product-requests"),
    api.get("/api/notifications?audience=customer")
  ]);
  state.adminRequests = requests;
  state.adminNotifications = notifications;
  renderAdmin();
}

function renderAdmin() {
  $("#adminRequests").innerHTML = state.adminRequests
    .map((request) => `<div class="line"><span>${request.name}<br><small>${request.status} · ${request.categoryId}</small></span><button data-approve="${request.id}" type="button">Approve</button><button data-reject-request="${request.id}" type="button">Reject</button></div>`)
    .join("");
  $("#adminNotifications").innerHTML = state.adminNotifications
    .map((item) => `<article class="notification"><strong>${item.title}</strong><small>${item.audience} · ${item.createdAt}</small><p>${item.body}</p></article>`)
    .join("");
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  try {
    if (target.dataset.role) setRole(target.dataset.role);
    if (target.dataset.category) {
      state.products = await api.get(`/api/catalogue/products?categoryId=${target.dataset.category}`);
      document.querySelectorAll("[data-category]").forEach((button) => button.classList.toggle("active", button === target));
      renderCustomer();
    }
    if (target.dataset.add) {
      state.cart[target.dataset.add] = (state.cart[target.dataset.add] || 0) + 1;
      renderCustomer();
      toast("Added to cart");
    }
    if (target.id === "checkoutButton") {
      await api.send("/api/customer/orders", "POST", { items: Object.entries(state.cart).map(([productId, qty]) => ({ productId, qty })), addressId: state.addresses[0]?.id, paymentMethod: "upi" });
      state.cart = {};
      toast("Order placed");
      await loadCustomer();
    }
    if (target.id === "addAddress") {
      await api.send("/api/customer/addresses", "POST", { type: "Other", label: "New saved address", line: "Map pin captured", lat: 19.07, lng: 72.87 });
      await loadCustomer();
    }
    if (target.dataset.deleteAddress) {
      await api.send(`/api/customer/addresses/${target.dataset.deleteAddress}`, "DELETE");
      await loadCustomer();
    }
    if (target.id === "notificationButton") {
      $("#customerNotifications").classList.toggle("hidden");
      if (state.role !== "customer") setRole("customer");
    }
    if (target.id === "markRead") {
      await api.send("/api/notifications/read", "PATCH", { userId: "customer-1" });
      await loadCustomer();
    }
    if (target.dataset.sellerTab) {
      state.sellerTab = target.dataset.sellerTab;
      renderSeller();
    }
    if (target.id === "toggleStore") {
      await api.send("/api/seller/profile", "PUT", { storeLive: !state.sellerProfile.storeLive });
      await loadSeller();
    }
    if (target.id === "saveSellerProfile") {
      await api.send("/api/seller/profile", "PUT", { storeStart: $("#storeStart").value, storeEnd: $("#storeEnd").value, slaValue: Number($("#slaValue").value), slaUnit: $("#slaUnit").value });
      toast("Seller profile saved");
      await loadSeller();
    }
    if (target.dataset.confirm) {
      await api.send(`/api/seller/orders/${target.dataset.confirm}`, "PATCH", { action: "confirm" });
      await loadSeller();
    }
    if (target.dataset.reject) {
      await api.send(`/api/seller/orders/${target.dataset.reject}`, "PATCH", { action: "reject", reason: "Seller rejected from mobile app" });
      await loadSeller();
    }
    if (target.dataset.live) {
      await api.send("/api/seller/products", "POST", { productId: target.dataset.live, price: 99, qty: 10, active: true });
      toast("Product made live");
      await loadSeller();
    }
    if (target.dataset.plus) {
      const product = state.sellerProducts.find((item) => item.sellerProductId === target.dataset.plus);
      await api.send(`/api/seller/products/${target.dataset.plus}`, "PATCH", { qty: product.qty + 1 });
      await loadSeller();
    }
    if (target.id === "submitRequest") {
      await api.send("/api/seller/product-requests", "POST", { name: $("#requestName").value, categoryId: $("#requestCategory").value, unit: $("#requestUnit").value });
      toast("Product request submitted");
      await loadSeller();
    }
    if (target.id === "publishNotification") {
      await api.send("/api/admin/notifications", "POST", { audience: $("#adminAudience").value, type: $("#adminType").value, title: $("#adminTitle").value, body: $("#adminBody").value });
      toast("Notification published");
      await loadAdmin();
    }
    if (target.dataset.approve) {
      await api.send(`/api/admin/product-requests/${target.dataset.approve}`, "PATCH", { status: "Approved" });
      await loadAdmin();
    }
    if (target.dataset.rejectRequest) {
      await api.send(`/api/admin/product-requests/${target.dataset.rejectRequest}`, "PATCH", { status: "Rejected", reason: "Rejected by admin" });
      await loadAdmin();
    }
  } catch (error) {
    toast(error.message);
  }
});

$("#searchInput").addEventListener("input", () => loadCustomer());
setRole("customer");
