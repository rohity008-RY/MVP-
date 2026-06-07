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
  role: "admin",
  view: "adminDashboard",
  dashboard: null,
  orders: [],
  sellers: [],
  requests: [],
  notifications: [],
  settings: null
};

const copy = {
  adminDashboard: ["Dashboard", "Monitor live marketplace health."],
  adminOrders: ["Orders", "Track parent orders, seller sub-orders, SLA, and refund state."],
  adminSellers: ["Sellers", "Review store live status, documents, inventory, and pending requests."],
  adminRequests: ["Product Requests", "Approve or reject seller-submitted catalogue requests."],
  adminNotifications: ["Notifications", "Publish and review customer or seller notifications."],
  adminSettings: ["Settings", "Configure payment methods and shopping rewards."]
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

async function loadAdmin() {
  const [dashboard, orders, sellers, requests, notifications, settings] = await Promise.all([
    api.get("/api/admin/dashboard"),
    api.get("/api/admin/orders"),
    api.get("/api/admin/sellers"),
    api.get("/api/admin/product-requests"),
    api.get("/api/admin/notifications"),
    api.get("/api/admin/settings")
  ]);
  state.dashboard = dashboard;
  state.orders = orders;
  state.sellers = sellers;
  state.requests = requests;
  state.notifications = notifications;
  state.settings = settings;
  renderAll();
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".admin-section").forEach((section) => section.classList.toggle("active", section.id === view));
  document.querySelectorAll("[data-admin-view]").forEach((button) => button.classList.toggle("active", button.dataset.adminView === view));
  $("#adminPageTitle").textContent = copy[view][0];
  $("#adminPageCopy").textContent = copy[view][1];
}

function applyRole() {
  const isAdmin = state.role === "admin";
  document.querySelectorAll(".admin-only").forEach((node) => node.classList.toggle("hidden", !isAdmin));
  document.querySelectorAll(".support-note").forEach((node) => node.classList.toggle("hidden", isAdmin));
  renderRequests();
}

function renderAll() {
  renderDashboard();
  renderOrders();
  renderSellers();
  renderRequests();
  renderNotifications();
  renderSettings();
  applyRole();
}

function renderDashboard() {
  const totals = state.dashboard?.totals || {};
  const cards = [
    ["Parent Orders", totals.orders || 0],
    ["Seller Sub-orders", totals.sellerSubOrders || 0],
    ["Placed", totals.placed || 0],
    ["Bag Packed", totals.packed || 0],
    ["Rejected", totals.rejected || 0],
    ["Sellers", totals.sellers || 0],
    ["Pending Requests", totals.productRequests || 0],
    ["Notifications", totals.notifications || 0]
  ];
  $("#adminStats").innerHTML = cards.map(([label, value]) => `
    <article class="stat-card"><small class="muted">${label}</small><b>${value}</b></article>
  `).join("");

  $("#adminPaymentSummary").innerHTML = `
    <h2>Payment Methods</h2>
    ${Object.entries(state.dashboard?.paymentMethods || {}).map(([id, method]) => `
      <div class="line"><span><b>${method.label}</b><br><small>${method.vendor}</small></span><span class="pill ${method.enabled ? "" : "red"}">${method.enabled ? "On" : "Off"}</span></div>
    `).join("")}
  `;
  const rewards = state.dashboard?.rewards || {};
  $("#adminRewardSummary").innerHTML = `
    <h2>Rewards</h2>
    <div class="line"><span>Status</span><strong>${rewards.enabled ? "Enabled" : "Disabled"}</strong></div>
    <div class="line"><span>Earn rule</span><strong>${rewards.points || 0} pts / Rs. ${rewards.earnRs || 0}</strong></div>
  `;
}

function renderOrders() {
  $("#adminOrderTable").innerHTML = `
    <div class="table-row header"><span>Order</span><span>Seller Shipment</span><span>Status</span><span>Payment</span></div>
    ${state.orders.flatMap((order) => order.subOrders.map((subOrder) => `
      <div class="table-row">
        <span><b>${order.id}</b><br><small>${order.createdAt} · ${money(order.total)}</small></span>
        <span><b>${subOrder.id}</b><br><small>${subOrder.seller} · SLA ${subOrder.sla}</small></span>
        <span><span class="pill ${subOrder.status === "Rejected" ? "red" : subOrder.status === "Placed" ? "orange" : ""}">${subOrder.status}</span></span>
        <span>${order.paymentState}<br><small>${subOrder.refundState || "No refund"}</small></span>
      </div>
    `)).join("")}
  `;
}

function renderSellers() {
  $("#adminSellerTable").innerHTML = `
    <div class="table-row header"><span>Seller</span><span>Compliance</span><span>Store</span><span>Activity</span></div>
    ${state.sellers.map((seller) => `
      <div class="table-row">
        <span><b>${seller.shopName}</b><br><small>${seller.ownerName} · ${seller.phone}</small></span>
        <span>FSSAI ${seller.documents?.fssai || "-"}<br><small>GST ${seller.documents?.gstin || "Optional"}</small></span>
        <span><span class="pill ${seller.storeLive ? "" : "red"}">${seller.storeLive ? "Live" : "Off"}</span><br><small>${seller.storeStart}-${seller.storeEnd}</small></span>
        <span>${seller.liveProducts} live products<br><small>${seller.pendingRequests} pending requests</small></span>
      </div>
    `).join("")}
  `;
}

function renderRequests() {
  const canAct = state.role === "admin";
  $("#adminRequestTable").innerHTML = `
    <div class="table-row header"><span>Request</span><span>Seller</span><span>Status</span><span>Action</span></div>
    ${state.requests.map((request) => `
      <div class="table-row">
        <span><b>${request.name}</b><br><small>${request.categoryId} · ${request.unit} · HSN ${request.hsn || "Optional"}</small></span>
        <span>${request.sellerId}<br><small>${request.createdAt}</small></span>
        <span><span class="pill ${request.status === "Rejected" ? "red" : request.status === "Pending" ? "orange" : ""}">${request.status}</span><br><small>${request.reason || ""}</small></span>
        <span>
          <button class="primary" data-approve-request="${request.id}" type="button" ${canAct && request.status === "Pending" ? "" : "disabled"}>Approve</button>
          <button class="danger" data-reject-request="${request.id}" type="button" ${canAct && request.status === "Pending" ? "" : "disabled"}>Reject</button>
        </span>
      </div>
    `).join("")}
  `;
}

function renderNotifications() {
  $("#adminNotificationLog").innerHTML = state.notifications.slice(0, 12).map((item) => `
    <article class="notification-card" style="margin:0 0 10px">
      <div class="line">
        <span><strong>${item.title}</strong><br><small>${item.audience} · ${item.type} · ${item.createdAt}</small></span>
        <span class="pill">${item.source}</span>
      </div>
      <p class="muted">${item.body}</p>
    </article>
  `).join("") || `<p class="muted">No notifications yet.</p>`;
}

function renderSettings() {
  const methods = state.settings?.paymentMethods || {};
  $("#paymentSettings").innerHTML = `
    <h2>Payment Methods</h2>
    ${Object.entries(methods).map(([id, method]) => `
      <div class="line">
        <span><b>${method.label}</b><br><small>${method.vendor}</small></span>
        <button class="${method.enabled ? "danger" : "primary"}" data-toggle-payment="${id}" type="button">${method.enabled ? "Disable" : "Enable"}</button>
      </div>
    `).join("")}
  `;
  const rewards = state.settings?.rewards || {};
  $("#rewardSettings").innerHTML = `
    <h2>Rewards</h2>
    <div class="form-grid">
      <label>Status
        <select id="rewardEnabled">
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      </label>
      <label>Rupees base<input id="rewardEarnRs" type="number" value="${rewards.earnRs || 100}"></label>
      <label>Points<input id="rewardPoints" type="number" value="${rewards.points || 10}"></label>
      <button class="primary" id="saveRewardsButton" type="button">Save rewards</button>
    </div>
  `;
  $("#rewardEnabled").value = String(Boolean(rewards.enabled));
}

async function updateSettings(nextSettings) {
  await api.send("/api/admin/settings", "PUT", nextSettings);
  toast("Settings updated");
  await loadAdmin();
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  try {
    if (button.dataset.adminView) setView(button.dataset.adminView);
    if (button.id === "publishNotificationButton") {
      if (state.role !== "admin") return toast("Support role cannot publish notifications");
      await api.send("/api/admin/notifications", "POST", {
        audience: $("#adminAudience").value,
        type: $("#adminType").value,
        title: $("#adminTitle").value,
        body: $("#adminBody").value
      });
      toast("Notification published");
      await loadAdmin();
    }
    if (button.dataset.approveRequest) {
      if (state.role !== "admin") return toast("Only Admin can approve requests");
      await api.send(`/api/admin/product-requests/${button.dataset.approveRequest}`, "PATCH", { status: "Approved" });
      toast("Request approved");
      await loadAdmin();
    }
    if (button.dataset.rejectRequest) {
      if (state.role !== "admin") return toast("Only Admin can reject requests");
      const reason = prompt("Reject reason", "Missing mandatory details");
      if (!reason) return;
      await api.send(`/api/admin/product-requests/${button.dataset.rejectRequest}`, "PATCH", { status: "Rejected", reason });
      toast("Request rejected");
      await loadAdmin();
    }
    if (button.dataset.togglePayment) {
      if (state.role !== "admin") return toast("Support role cannot change settings");
      const paymentMethods = structuredClone(state.settings.paymentMethods);
      paymentMethods[button.dataset.togglePayment].enabled = !paymentMethods[button.dataset.togglePayment].enabled;
      await updateSettings({ paymentMethods });
    }
    if (button.id === "saveRewardsButton") {
      if (state.role !== "admin") return toast("Support role cannot change settings");
      await updateSettings({
        rewards: {
          enabled: $("#rewardEnabled").value === "true",
          earnRs: Number($("#rewardEarnRs").value),
          points: Number($("#rewardPoints").value)
        }
      });
    }
  } catch (error) {
    toast(error.message);
  }
});

$("#consoleRole").addEventListener("change", () => {
  state.role = $("#consoleRole").value;
  toast(`${state.role === "admin" ? "Admin" : "Support"} access enabled`);
  applyRole();
});

loadAdmin().catch((error) => toast(error.message));
