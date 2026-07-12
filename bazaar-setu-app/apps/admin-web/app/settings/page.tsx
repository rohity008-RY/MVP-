import { apiGet } from "../../lib/api";
import { publishNotification, updateRewardRule, updateSellerLeadStatus } from "../actions";

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

type AuditLog = {
  id: string;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: unknown;
  ipAddress?: string | null;
  createdAt: string;
};

export default async function SettingsPage() {
  const [notifications, settings, leads] = await Promise.all([
    apiGet<Notification[]>("/api/admin/notifications"),
    apiGet<PlatformSettings>("/api/admin/settings"),
    apiGet<SellerLead[]>("/api/admin/seller-leads")
  ]);
  let auditLogs: AuditLog[] = [];
  try {
    auditLogs = await apiGet<AuditLog[]>("/api/admin/audit-logs?limit=20");
  } catch {
    auditLogs = [];
  }

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
            <form action={updateRewardRule} className="settings-form">
              <label className="form-label">
                Reward status
                <select className="input" name="enabled" defaultValue={settings.rewardConfig.enabled ? "true" : "false"}>
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </label>
              <label className="form-label">
                Points per Rs 100
                <input className="input" name="pointsPerHundred" type="number" min="0" defaultValue={settings.rewardConfig.pointsPerHundred} />
              </label>
              <button className="button primary" type="submit">Save rewards</button>
            </form>
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
              <th>Action</th>
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
                <td className="actions-cell">
                  <form action={updateSellerLeadStatus} className="inline-form">
                    <input type="hidden" name="leadId" value={lead.id} />
                    <select className="input compact" name="status" defaultValue={lead.status}>
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="ONBOARDED">Onboarded</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    <input className="input compact" name="notes" placeholder="Support note" />
                    <button className="button ghost" type="submit">Update</button>
                  </form>
                </td>
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
        <form action={publishNotification} className="compose-form">
          <select className="input" name="audience" defaultValue="all">
            <option value="all">All users</option>
            <option value="customer">Customers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admin/Ops</option>
          </select>
          <select className="input" name="type" defaultValue="offer">
            <option value="offer">Offer</option>
            <option value="order">Order</option>
            <option value="system">System</option>
            <option value="approval">Approval</option>
            <option value="refund">Refund</option>
          </select>
          <input className="input" name="title" placeholder="Notification title" required />
          <input className="input" name="body" placeholder="Message body" required />
          <button className="button primary" type="submit">Publish</button>
        </form>
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

      <section className="panel section-gap">
        <div className="panel-header">
          <span>Admin Audit Logs</span>
          <span className="muted">Admin-only trail for sensitive backend changes</span>
        </div>
        {auditLogs.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString("en-IN")}</td>
                  <td><span className="pill">{log.actorRole ?? "system"}</span></td>
                  <td><b>{log.action.replaceAll("_", " ")}</b></td>
                  <td>
                    {log.entityType}
                    {log.entityId ? <div className="muted">{log.entityId}</div> : null}
                  </td>
                  <td className="muted">{log.metadata ? JSON.stringify(log.metadata).slice(0, 120) : "No metadata"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="metric-card">
            <span className="muted">No audit rows visible</span>
            <b>Login as Admin to review mutation history.</b>
            <small>Support users can continue daily ops without access to admin-only audit data.</small>
          </div>
        )}
      </section>
    </>
  );
}
