import { apiGet } from "../lib/api";

type Dashboard = {
  totalOrders: number;
  todayOrders: number;
  todayRevenue: number;
  liveSellers: number;
  disabledSellers: number;
  pendingProductRequests: number;
  pendingDocuments: number;
  activeSubOrders: number;
  breachedSla: number;
  dueSoonSla: number;
  pendingRefunds: number;
  sellerLeads: number;
};

export default async function DashboardPage() {
  const dashboard = await apiGet<Dashboard>("/api/ops/dashboard");
  const stats = [
    ["Orders", dashboard.totalOrders, `${dashboard.todayOrders} created today`],
    ["Active Sub-orders", dashboard.activeSubOrders, `${dashboard.breachedSla} SLA breached, ${dashboard.dueSoonSla} due soon`],
    ["Live Sellers", dashboard.liveSellers, `${dashboard.disabledSellers} disabled stores`],
    ["Ops Queue", dashboard.pendingProductRequests + dashboard.pendingDocuments + dashboard.pendingRefunds, "Catalogue, documents, refunds"]
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow">Ops Command Centre</div>
          <h1 className="title">Bazaar Setu ops backend</h1>
        </div>
        <span className="pill">Today revenue Rs {dashboard.todayRevenue}</span>
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
              Monitor {dashboard.pendingRefunds} refund pending sub-order{dashboard.pendingRefunds === 1 ? "" : "s"}.
            </div>
            <div className="todo-row">
              <span className="dot blue" />
              Review {dashboard.sellerLeads} seller lead{dashboard.sellerLeads === 1 ? "" : "s"} from customers.
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
              <span>Monitor SLA, packed state, handover readiness, delivery exceptions, and refund risk.</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
