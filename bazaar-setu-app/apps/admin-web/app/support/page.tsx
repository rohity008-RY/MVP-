import type { SupportTicket } from "@bazaarsetu/shared-types";
import { updateSupportTicket } from "../actions";
import { apiGet } from "../../lib/api";

const statuses = ["NEW", "ASSIGNED", "WAITING_CUSTOMER", "WAITING_SELLER", "WAITING_DELIVERY", "REFUND_REVIEW", "RESOLVED", "REOPENED"];
const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function formatDate(value?: string | null) {
  if (!value) return "No SLA";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function isDue(ticket: SupportTicket) {
  return ticket.status !== "RESOLVED" && ticket.slaDueAt ? new Date(ticket.slaDueAt).getTime() < Date.now() : false;
}

export default async function SupportPage() {
  const tickets = await apiGet<SupportTicket[]>("/api/ops/support-tickets");
  const open = tickets.filter((ticket) => ticket.status !== "RESOLVED").length;
  const critical = tickets.filter((ticket) => ticket.status !== "RESOLVED" && ["HIGH", "CRITICAL"].includes(ticket.priority)).length;
  const due = tickets.filter(isDue).length;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow">Support Desk</div>
          <h1 className="title">Customer, seller, refund, and delivery escalations</h1>
        </div>
        <span className="pill warn">{open} open</span>
      </div>

      <section className="stat-row">
        <article className="card"><span className="muted">Open tickets</span><b>{open}</b><small>Customer + seller + system</small></article>
        <article className="card"><span className="muted">High / Critical</span><b>{critical}</b><small>Needs fast action</small></article>
        <article className="card"><span className="muted">SLA due</span><b>{due}</b><small>Breached support SLA</small></article>
        <article className="card"><span className="muted">Refund review</span><b>{tickets.filter((ticket) => ticket.status === "REFUND_REVIEW").length}</b><small>Payment closure needed</small></article>
      </section>

      <section className="support-grid">
        {tickets.map((ticket) => (
          <article className="panel ticket-card" key={ticket.id}>
            <div className="panel-header">
              <div>
                <span>{ticket.ticketNumber}</span>
                <small>{ticket.source} · {ticket.category}{ticket.subCategory ? ` / ${ticket.subCategory}` : ""}</small>
              </div>
              <span className={ticket.priority === "CRITICAL" || isDue(ticket) ? "pill danger" : ticket.priority === "HIGH" ? "pill warn" : "pill"}>{ticket.priority}</span>
            </div>
            <div className="stack">
              <div className="ticket-summary">
                <b>{ticket.subject}</b>
                <span>{ticket.description}</span>
                <span className={isDue(ticket) ? "danger-text" : "muted"}>SLA: {formatDate(ticket.slaDueAt)}</span>
              </div>

              <div className="ticket-meta-grid">
                <div className="role-card"><b>Customer</b><span>{ticket.customer?.user?.name ?? ticket.customerId ?? "General"} · {ticket.customer?.user?.phone ?? "No phone"}</span></div>
                <div className="role-card"><b>Seller</b><span>{ticket.seller?.shopName ?? ticket.sellerId ?? "Not linked"} · {ticket.seller?.user?.phone ?? "No phone"}</span></div>
                <div className="role-card"><b>Order</b><span>{ticket.parentOrderId ?? "No parent"} · {ticket.subOrderId ?? "No sub-order"}</span></div>
                <div className="role-card"><b>Owner</b><span>{ticket.assignedTo?.name ?? "Unassigned"} · {ticket.status}</span></div>
              </div>

              <div className="message-list">
                {ticket.messages?.slice(-4).map((message) => (
                  <div className="message-row" key={message.id}>
                    <b>{message.authorRole} · {message.visibility}</b>
                    <span>{message.message}</span>
                  </div>
                ))}
              </div>

              <form action={updateSupportTicket} className="support-form">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <select className="input compact" name="status" defaultValue={ticket.status}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <select className="input compact" name="priority" defaultValue={ticket.priority}>
                  {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
                <input className="input" name="internalNote" placeholder="Internal note" />
                <input className="input" name="customerReply" placeholder="Reply to customer" />
                <input className="input" name="sellerReply" placeholder="Reply to seller" />
                <button className="button primary">Update ticket</button>
              </form>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
