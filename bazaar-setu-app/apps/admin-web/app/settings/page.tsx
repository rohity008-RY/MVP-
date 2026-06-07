import { apiGet } from "../../lib/api";

type Notification = {
  id: string;
  audience: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
};

type PlatformSettings = {
  paymentConfig: { vendors: Array<{ id: string; label: string; enabled: boolean }> };
  rewardConfig: { enabled: boolean; pointsPerHundred: number };
};

type SellerLead = {
  id: string;
  name: string;
  phone: string;
  notes?: string | null;
  status: string;
  createdAt: string;
};

export default async function SettingsPage() {
  const [notifications, settings, leads] = await Promise.all([
    apiGet<Notification[]>("/api/admin/notifications"),
    apiGet<PlatformSettings>("/api/admin/settings"),
    apiGet<SellerLead[]>("/api/admin/seller-leads")
  ]);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow">Platform Controls</div>
          <h1 className="title">Payments, rewards, notifications</h1>
        </div>
        <span className="pill">Config scaffold</span>
      </div>

      <section className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <span>Payment Vendors</span>
            <span className="pill">Checkout visible</span>
          </div>
          <div className="stack">
            {settings.paymentConfig.vendors.map((method) => (
              <div className="setting-row" key={method.id}>
                <div>
                  <b>{method.label}</b>
                  <span>Shown in customer checkout when enabled by admin.</span>
                </div>
                <span className={method.enabled ? "toggle on" : "toggle"} />
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span>Rewards</span>
            <span className="pill warn">Pilot</span>
          </div>
          <div className="stack">
            <div className="metric-card">
              <span className="muted">Rule</span>
              <b>{settings.rewardConfig.enabled ? settings.rewardConfig.pointsPerHundred : 0} point per Rs 100</b>
              <small>Reward rules are available through the backend settings API.</small>
            </div>
            <div className="metric-card">
              <span className="muted">Become Seller Leads</span>
              <b>{leads.length} open lead{leads.length === 1 ? "" : "s"}</b>
              <small>Customer seller-interest submissions route into this ops queue.</small>
            </div>
          </div>
        </div>
      </section>

      <section className="panel section-gap">
        <div className="panel-header">
          <span>Become Seller Leads</span>
          <span className="muted">Support can contact and move these through onboarding</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Notes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <b>{lead.name}</b>
                  <div className="muted">{new Date(lead.createdAt).toLocaleString("en-IN")}</div>
                </td>
                <td>{lead.phone}</td>
                <td>{lead.notes ?? "No notes"}</td>
                <td><span className="pill warn">{lead.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel section-gap">
        <div className="panel-header">
          <span>Published Notifications</span>
          <span className="muted">Admin-created messages shown in customer and seller apps</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Audience</th>
              <th>Type</th>
              <th>Message</th>
              <th>Published</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id}>
                <td><span className="pill">{notification.audience}</span></td>
                <td>{notification.type}</td>
                <td>
                  <b>{notification.title}</b>
                  <div className="muted">{notification.body}</div>
                </td>
                <td>{new Date(notification.createdAt).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
