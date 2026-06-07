import { apiGet } from "../lib/api";

type Dashboard = {
  orders: number;
  sellers: number;
  productRequests: number;
  notifications: number;
};

export default async function DashboardPage() {
  const dashboard = await apiGet<Dashboard>("/api/admin/dashboard");
  const stats = [
    ["Orders", dashboard.orders, "Parent orders across all customer carts"],
    ["Sellers", dashboard.sellers, "Self-serve seller accounts"],
    ["Pending Requests", dashboard.productRequests, "Products waiting for ops approval"],
    ["Notifications", dashboard.notifications, "Published platform messages"]
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow">Ops Command Centre</div>
          <h1 className="title">Bazaar Setu backend</h1>
        </div>
        <span className="pill">Role: Admin / Support</span>
      </div>

      <section className="stat-row">
        {stats.map(([label, value, hint]) => (
          <article className="card" key={label}>
            <span className="muted">{label}</span>
            <b>{value}</b>
            <small>{hint}</small>
          </article>
        ))}
      </section>

      <section className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <span>Today Focus</span>
            <span className="pill warn">Live ops</span>
          </div>
          <div className="stack">
            <div className="todo-row">
              <span className="dot orange" />
              Verify pending catalogue approvals before sellers go live.
            </div>
            <div className="todo-row">
              <span className="dot green" />
              Monitor rejected prepaid sub-orders for refund action.
            </div>
            <div className="todo-row">
              <span className="dot blue" />
              Publish customer/seller notifications from Settings.
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span>RBAC Snapshot</span>
            <span className="pill">Enabled</span>
          </div>
          <div className="stack">
            <div className="role-card">
              <b>Admin</b>
              <span>Full catalogue, seller, rewards, payment, notification, and refund control.</span>
            </div>
            <div className="role-card">
              <b>Support</b>
              <span>View orders, handle customer issues, update refund notes, and assist sellers.</span>
            </div>
            <div className="role-card">
              <b>Logistics</b>
              <span>Monitor SLA, pickup, handover, delivery assignment, and route exceptions.</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
