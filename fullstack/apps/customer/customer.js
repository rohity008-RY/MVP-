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
  categories: [],
  catalogue: [],
  products: [],
  settings: null,
  profile: null,
  addresses: [],
  activeCategoryId: "",
  cart: JSON.parse(localStorage.getItem("bazaarSetuCustomerCart") || "{}"),
  orders: [],
  notifications: []
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

function saveCart() {
  localStorage.setItem("bazaarSetuCustomerCart", JSON.stringify(state.cart));
}

function cartCount() {
  return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
}

function cartLines() {
  return Object.entries(state.cart)
    .map(([productId, qty]) => ({ product: state.catalogue.find((product) => product.id === productId), qty }))
    .filter((line) => line.product);
}

function cartTotal() {
  return cartLines().reduce((sum, line) => sum + line.product.price * line.qty, 0);
}

function activeAddress() {
  return state.addresses[0];
}

function setScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.toggle("active", screen.id === screenId));
  document.querySelectorAll("[data-customer-view]").forEach((button) => button.classList.toggle("active", button.dataset.customerView === screenId));
  if (screenId === "customerCart") renderCart();
  if (screenId === "customerOrders") renderOrders();
  if (screenId === "customerProfile") renderProfile();
  if (screenId === "customerNotifications") renderNotifications();
}

async function loadProducts() {
  const params = new URLSearchParams();
  const query = $("#customerSearch").value.trim();
  if (query) params.set("q", query);
  if (state.activeCategoryId) params.set("categoryId", state.activeCategoryId);
  state.products = await api.get(`/api/catalogue/products?${params.toString()}`);
  renderProducts();
  renderCart();
}

async function loadCustomer() {
  const [home, catalogue, profile, addresses, orders, settings, notifications] = await Promise.all([
    api.get("/api/customer/home"),
    api.get("/api/catalogue/products"),
    api.get("/api/customer/profile"),
    api.get("/api/customer/addresses"),
    api.get("/api/customer/orders"),
    api.get("/api/settings"),
    api.get("/api/notifications?audience=customer")
  ]);
  state.categories = home.categories;
  state.catalogue = catalogue;
  state.products = home.products;
  state.profile = profile;
  state.addresses = addresses;
  state.orders = orders;
  state.settings = settings;
  state.notifications = notifications;
  renderAll();
}

function renderAll() {
  $("#activeAddressText").textContent = activeAddress()?.label || "Add delivery address";
  renderCategories();
  renderProducts();
  renderCart();
  renderOrders();
  renderProfile();
  renderNotifications();
}

function renderCategories() {
  $("#customerCategories").innerHTML = [
    `<button class="cat-chip ${state.activeCategoryId ? "" : "active"}" data-category="" type="button"><span class="cat-icon" style="background:#f2f0ec">All</span><span class="cat-label">All</span></button>`,
    ...state.categories.map((category) => `<button class="cat-chip ${state.activeCategoryId === category.id ? "active" : ""}" data-category="${category.id}" type="button"><span class="cat-icon" style="background:${category.color}">${category.icon.slice(0, 2).toUpperCase()}</span><span class="cat-label">${category.name}</span></button>`)
  ].join("");
}

function renderProducts() {
  $("#customerProductCount").textContent = `${state.products.length} items`;
  $("#customerProducts").innerHTML = state.products.map((product) => {
    const qty = state.cart[product.id] || 0;
    return `
      <article class="prod-card">
        <div class="prod-img" style="background:${product.imageColor}">
          ${product.imageText.slice(0, 2).toUpperCase()}
          <div class="prod-badge">LIVE</div>
          <button class="prod-fav" type="button" aria-label="Wishlist"><i class="ti ti-heart"></i></button>
        </div>
        <div class="prod-info">
          <div class="prod-seller">Bazaar Setu seller</div>
          <div class="prod-name">${product.name}</div>
          <div class="prod-weight">${product.unit} · HSN ${product.hsn || "Optional"}</div>
          <div class="prod-footer">
            <div class="prod-price">${money(product.price)}</div>
            ${qty ? `
              <span class="qty-ctrl">
                <button class="qty-btn" data-cart-dec="${product.id}" type="button"><i class="ti ti-minus"></i></button>
                <strong class="qty-val">${qty}</strong>
                <button class="qty-btn" data-cart-inc="${product.id}" type="button"><i class="ti ti-plus"></i></button>
              </span>
            ` : `<button class="add-btn" data-cart-inc="${product.id}" type="button" aria-label="Add ${product.name}"><i class="ti ti-plus"></i></button>`}
          </div>
        </div>
      </article>
    `;
  }).join("");
  $("#customerCartBadge").textContent = cartCount() ? `(${cartCount()})` : "";
}

function renderCart() {
  const lines = cartLines();
  $("#cartLines").innerHTML = `
    <section class="cart-seller-section">
      <div class="cart-seller-hdr">
        <div class="csh-avatar">BS</div>
        <div class="csh-name">${lines.length ? "Bazaar Setu Cart" : "Cart is empty"}</div>
        <div class="csh-eta"><i class="ti ti-clock"></i> 45 min</div>
      </div>
      ${lines.length ? lines.map((line) => `
        <div class="cart-item">
          <div class="ci-img" style="background:${line.product.imageColor}">${line.product.imageText.slice(0, 2).toUpperCase()}</div>
          <div class="ci-info">
            <div class="ci-name">${line.product.name}</div>
            <div class="ci-wt">${line.product.unit} · HSN ${line.product.hsn || "Optional"}</div>
            <div class="ci-price">${money(line.product.price)}</div>
          </div>
          <span class="qty-ctrl">
            <button class="qty-btn" data-cart-dec="${line.product.id}" type="button"><i class="ti ti-minus"></i></button>
            <strong class="qty-val">${line.qty}</strong>
            <button class="qty-btn" data-cart-inc="${line.product.id}" type="button"><i class="ti ti-plus"></i></button>
          </span>
        </div>
      `).join("") : `<div class="cart-item"><div class="ci-info"><div class="ci-name">No items yet</div><div class="ci-wt">Add products from home to checkout.</div></div></div>`}
    </section>
    <section class="cart-summary">
      <div class="cs-row"><span class="cs-label">Items</span><span class="cs-val">${cartCount()}</span></div>
      <div class="cs-row"><span class="cs-label">Delivery fee</span><span class="cs-val">Rs. 29</span></div>
      <hr class="cs-divider">
      <div class="cs-row"><span class="cs-total-label">Total</span><span class="cs-total-val">${money(cartTotal() + (lines.length ? 29 : 0))}</span></div>
    </section>
    <button class="checkout-btn" id="checkoutButton" type="button" ${lines.length ? "" : "disabled"}><i class="ti ti-credit-card"></i> Place order</button>
  `;

  const methods = state.settings?.paymentMethods || {};
  $("#paymentMethods").innerHTML = `
    <section class="cart-seller-section">
      <div class="cart-seller-hdr"><div class="csh-avatar" style="background:#185fa5">P</div><div class="csh-name">Payment Options</div><div class="csh-eta">Enabled</div></div>
      ${Object.entries(methods).filter(([, method]) => method.enabled).map(([id, method]) => `
      <div class="cart-item">
        <div class="ci-img"><i class="ti ti-wallet"></i></div>
        <div class="ci-info"><div class="ci-name">${method.label}</div><div class="ci-wt">${method.vendor}</div></div>
        <span class="status-pill">${id.toUpperCase()}</span>
      </div>
      `).join("") || `<div class="cart-item"><div class="ci-info"><div class="ci-name">No payment method enabled by Admin.</div></div></div>`}
    </section>
  `;
  $("#customerCartBadge").textContent = cartCount() ? `(${cartCount()})` : "";
}

function renderOrders() {
  $("#ordersList").innerHTML = state.orders.length ? state.orders.map((order) => `
    <article class="order-card">
      <div class="oc-header">
        <div><div class="oc-id">${order.id}</div><div class="oc-date">${order.createdAt} · ${order.paymentState}</div></div>
        <span class="status-pill">${order.status}</span>
      </div>
      ${order.subOrders.map((subOrder) => `
        <div class="oc-items">
          <div class="oc-item-thumb">${subOrder.items[0]?.name.slice(0, 2).toUpperCase() || "BS"}</div>
          <div class="oc-info"><div class="oc-name">${subOrder.id}</div><div class="oc-sub">${subOrder.status}${subOrder.invoiceNumber ? ` · Invoice ${subOrder.invoiceNumber}` : ""}</div></div>
          <div class="oc-amount">${money(order.total)}</div>
        </div>
      `).join("")}
    </article>
  `).join("") : `<section class="cart-seller-section"><div class="cart-item"><div class="ci-info"><div class="ci-name">No orders yet</div><div class="ci-wt">Your Bazaar Setu orders will appear here.</div></div></div></section>`;
}

function renderProfile() {
  $("#profileSummary").innerHTML = `
    <div class="ph-top">
      <div class="ph-avatar">${(state.profile?.name || "Customer").slice(0, 1)}</div>
      <div style="flex:1"><div class="ph-name">${state.profile?.name || "Customer"}</div><div class="ph-phone">${state.profile?.phone || "-"}</div></div>
    </div>
    <div class="ph-stats">
      <div class="ph-stat"><div class="ph-stat-val">${state.orders.length}</div><div class="ph-stat-label">Orders</div></div>
      <div class="ph-stat"><div class="ph-stat-val">${state.profile?.rewardPoints || 0}</div><div class="ph-stat-label">Rewards</div></div>
      <div class="ph-stat"><div class="ph-stat-val">${state.addresses.length}/5</div><div class="ph-stat-label">Address</div></div>
    </div>
  `;

  $("#addressManager").innerHTML = `
    <section class="profile-card">
    ${state.addresses.map((address) => `
      <div class="profile-row">
        <i class="ti ti-map-pin"></i>
        <span><b>${address.type}: ${address.label}</b><small>${address.line}<br>Lat ${address.lat}, Lng ${address.lng}</small></span>
        <span>
          <button class="qty-btn" data-edit-address="${address.id}" type="button"><i class="ti ti-pencil"></i></button>
          <button class="qty-btn" data-delete-address="${address.id}" type="button"><i class="ti ti-trash"></i></button>
        </span>
      </div>
    `).join("")}
      <div class="profile-row"><i class="ti ti-plus"></i><span><b>Add address</b><small>Save up to five locations.</small></span><button class="add-btn" id="addAddressButton" type="button" ${state.addresses.length >= 5 ? "disabled" : ""}><i class="ti ti-plus"></i></button></div>
    </section>
  `;

  $("#becomeSellerCard").innerHTML = `
    <section class="profile-card">
      <div class="profile-row"><i class="ti ti-building-store"></i><span><b>Become a Seller</b><small>Send your interest to Admin/Support for onboarding.</small></span><button class="add-btn" id="becomeSellerButton" type="button"><i class="ti ti-arrow-right"></i></button></div>
    </section>
  `;
}

function renderNotifications() {
  const unread = state.notifications.filter((item) => !(item.readBy || []).includes("customer-1")).length;
  $("#customerNotificationCount").textContent = unread ? String(unread) : "";
  $("#customerNotificationList").innerHTML = `
    ${state.notifications.map((item) => `
      <article class="notification-card">
        <strong>${item.title}</strong>
        <div class="oc-date">${item.type} · ${item.createdAt} · ${item.source}</div>
        <p>${item.body}</p>
      </article>
    `).join("") || `<section class="notification-card"><strong>No notifications</strong><p>Admin updates will appear here.</p></section>`}
    <section class="cart-seller-section"><div class="cart-item"><button class="checkout-btn" id="markReadButton" type="button" style="margin:0;width:100%">Mark all as read</button></div></section>
  `;
}

async function checkout() {
  const lines = cartLines();
  if (!lines.length) return;
  const address = activeAddress();
  if (!address) {
    toast("Add an address before checkout");
    setScreen("customerProfile");
    return;
  }
  const order = await api.send("/api/customer/orders", "POST", {
    items: lines.map((line) => ({ productId: line.product.id, qty: line.qty })),
    addressId: address.id,
    paymentMethod: "upi"
  });
  state.cart = {};
  saveCart();
  toast(`Order ${order.id} placed`);
  await loadCustomer();
  setScreen("customerOrders");
}

async function addAddress() {
  if (state.addresses.length >= 5) {
    toast("Maximum 5 addresses allowed");
    return;
  }
  const label = prompt("Address label", "New Home");
  if (!label) return;
  const line = prompt("Address line", "Google map pin captured address") || "Google map pin captured address";
  await api.send("/api/customer/addresses", "POST", {
    type: "Other",
    label,
    line,
    lat: 19.07,
    lng: 72.87
  });
  toast("Address saved");
  await loadCustomer();
}

async function editAddress(addressId) {
  const address = state.addresses.find((item) => item.id === addressId);
  if (!address) return;
  const label = prompt("Update address label", address.label);
  if (!label) return;
  const line = prompt("Update address line", address.line) || address.line;
  await api.send(`/api/customer/addresses/${addressId}`, "PUT", { ...address, label, line });
  toast("Address updated");
  await loadCustomer();
}

function setupVoiceSearch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    $("#voiceSearchButton").title = "Voice search not supported in this browser";
    return;
  }
  $("#voiceSearchButton").addEventListener("click", () => {
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      $("#customerSearch").value = event.results[0][0].transcript;
      loadProducts().catch((error) => toast(error.message));
    };
    recognition.onerror = () => toast("Voice search could not start");
    recognition.start();
  });
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  try {
    if (button.dataset.customerView) setScreen(button.dataset.customerView);
    if (button.id === "quickCartButton") setScreen("customerCart");
    if (button.id === "activeAddressButton") setScreen("customerProfile");
    if (button.id === "customerNotificationButton") setScreen("customerNotifications");
    if (button.dataset.category !== undefined) {
      state.activeCategoryId = button.dataset.category;
      renderCategories();
      await loadProducts();
    }
    if (button.dataset.cartInc) {
      state.cart[button.dataset.cartInc] = (state.cart[button.dataset.cartInc] || 0) + 1;
      saveCart();
      renderProducts();
      renderCart();
      toast("Added to cart");
    }
    if (button.dataset.cartDec) {
      state.cart[button.dataset.cartDec] = Math.max(0, (state.cart[button.dataset.cartDec] || 0) - 1);
      if (!state.cart[button.dataset.cartDec]) delete state.cart[button.dataset.cartDec];
      saveCart();
      renderProducts();
      renderCart();
    }
    if (button.id === "checkoutButton") await checkout();
    if (button.id === "addAddressButton") await addAddress();
    if (button.dataset.editAddress) await editAddress(button.dataset.editAddress);
    if (button.dataset.deleteAddress) {
      await api.send(`/api/customer/addresses/${button.dataset.deleteAddress}`, "DELETE");
      toast("Address removed");
      await loadCustomer();
    }
    if (button.id === "becomeSellerButton") toast("Seller lead sent to Admin/Support");
    if (button.id === "markReadButton") {
      await api.send("/api/notifications/read", "PATCH", { userId: "customer-1" });
      await loadCustomer();
    }
  } catch (error) {
    toast(error.message);
  }
});

let searchTimer;
$("#customerSearch").addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadProducts().catch((error) => toast(error.message)), 250);
});

setupVoiceSearch();
loadCustomer().catch((error) => toast(error.message));
