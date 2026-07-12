import { apiGet } from "../../lib/api";
import {
  addOpsNote,
  approveProductRequest,
  markRefunded,
  rejectProductRequest,
  toggleSellerLive
} from "../actions";

type SlaOrder = {
  id: string;
  status: string;
  paymentState: string;
  invoiceNumber?: string | null;
  slaDueAt?: string | null;
  slaMinutesRemaining?: number | null;
  slaBreached: boolean;
  rejectReason?: string | null;
  seller: { shopName: string };
  parentOrder: { customer: { user: { name: string; phone: string } } };
  items: Array<{ name: string; qty: number; price: number }>;
};

type RefundOrder = {
  id: string;
  status: string;
  paymentState: string;
  refundAmount?: number | null;
  rejectReason?: string | null;
  seller: { shopName: string };
  parentOrder: { customer: { user: { name: string; phone: string } } };
};

type SellerVerification = {
  id: string;
  ownerName: string;
  shopName: string;
  storeLive: boolean;
  opsState: string;
  pendingDocs: number;
  rejectedDocs: number;
  liveProducts: number;
  user: { phone: string; email?: string | null };
  locations: Array<{ label: string; city: string; openTime: string; closeTime: string }>;
};

type CatalogueRequest = {
  id: string;
  name: string;
  unit: string;
  categoryId: string;
  status: string;
  reason?: string | null;
  seller: { shopName: string };
};

function statusClass(status: string, breached = false) {
  if (breached || ["REJECTED", "CANCELLED", "REFUNDED", "REFUND_PENDING"].includes(status)) return "pill danger";
  if (["INVOICE_REQUIRED", "BAG_PACKED", "PENDING"].includes(status)) return "pill warn";
  return "pill";
}

function slaLabel(order: SlaOrder) {
  if (typeof order.slaMinutesRemaining !== "number") return "No SLA";
  if (order.slaBreached) return `${Math.abs(order.slaMinutesRemaining)}m late`;
  return `${order.slaMinutesRemaining}m left`;
}

export default async function OpsPage() {
  const [slaOrders, refunds, sellerVerification, catalogueRequests] = await Promise.all([
    apiGet<SlaOrder[]>("/api/ops/sla?state=all"),
    apiGet<RefundOrder[]>("/api/ops/refunds?state=all"),
    apiGet<SellerVerification[]>("/api/ops/seller-verification"),
    apiGet<CatalogueRequest[]>("/api/ops/catalogue-requests")
  ]);

  const pendingRequests = catalogueRequests.filter((request) => request.status === "PENDING");

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow">Ops Backend</div>
          <h1 className="title">Daily command queues</h1>
        </div>
        <span className="pill warn">{slaOrders.filter((order) => order.slaBreached).length} SLA breached</span>
      </div>

      <section className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <span>SLA Monitor</span>
            <span className="muted">Seller sub-orders with customer-visible SLA</span>
          </div>
          <div className="stack">
            {slaOrders.slice(0, 8).map((order) => (
              <div className="ops-row vertical" key={order.id}>
                <div>
                  <b>{order.seller.shopName}</b>
                  <span>{order.parentOrder.customer.user.name} · {order.items.map((item) => `${item.name} x${item.qty}`).join(", ")}</span>
                </div>
                <div className="row-actions">
                  <span className={statusClass(order.status, order.slaBreached)}>
                    {slaLabel(order)}
                  </span>
                  <form action={addOpsNote} className="inline-form">
                    <input type="hidden" name="subOrderId" value={order.id} />
                    <input className="input compact" name="note" placeholder="Ops note" />
                    <button className="button ghost" type="submit">Add note</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span>Refund Desk</span>
            <span className="muted">Rejected/cancelled prepaid follow-up</span>
          </div>
          <div className="stack">
            {refunds.length ? refunds.slice(0, 8).map((refund) => (
              <div className="ops-row vertical" key={refund.id}>
                <div>
                  <b>{refund.parentOrder.customer.user.name}</b>
                  <span>{refund.seller.shopName} · {refund.rejectReason ?? "No rejection note"}</span>
                </div>
                <div className="row-actions">
                  <span className={statusClass(refund.paymentState)}>{refund.paymentState.replaceAll("_", " ")}</span>
                  {refund.paymentState === "REFUND_PENDING" ? (
                    <form action={markRefunded} className="inline-form">
                      <input type="hidden" name="subOrderId" value={refund.id} />
                      <input className="input compact" name="refundAmount" inputMode="numeric" placeholder={String(refund.refundAmount ?? 0)} />
                      <input className="input compact" name="note" placeholder="Refund note" />
                      <button className="button primary" type="submit">Mark refunded</button>
                    </form>
                  ) : null}
                </div>
              </div>
            )) : <div className="empty">No refund queue right now.</div>}
          </div>
        </div>
      </section>

      <section className="panel section-gap">
        <div className="panel-header">
          <span>Seller Verification</span>
          <span className="muted">Docs, live state, locations, products</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Seller</th>
              <th>Ops State</th>
              <th>Docs</th>
              <th>Locations</th>
              <th>Products</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sellerVerification.map((seller) => (
              <tr key={seller.id}>
                <td>
                  <b>{seller.shopName}</b>
                  <div className="muted">{seller.ownerName} · {seller.user.phone}</div>
                </td>
                <td><span className={seller.storeLive ? "pill" : "pill warn"}>{seller.opsState.replaceAll("_", " ")}</span></td>
                <td>
                  <b>{seller.pendingDocs}</b> pending
                  <div className="muted">{seller.rejectedDocs} rejected</div>
                </td>
                <td>{seller.locations.map((location) => `${location.label}, ${location.city}`).join(" · ") || "No location"}</td>
                <td><b>{seller.liveProducts}</b> live</td>
                <td className="actions-cell">
                  <form action={toggleSellerLive} className="inline-form">
                    <input type="hidden" name="sellerId" value={seller.id} />
                    <input type="hidden" name="storeLive" value={seller.storeLive ? "false" : "true"} />
                    <input className="input compact" name="reason" placeholder={seller.storeLive ? "Disable reason" : "Enable note"} />
                    <button className={seller.storeLive ? "button danger" : "button primary"} type="submit">
                      {seller.storeLive ? "Disable" : "Enable"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel section-gap">
        <div className="panel-header">
          <span>Catalogue Approval Backend</span>
          <span className="pill warn">{pendingRequests.length} pending</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Seller</th>
              <th>Category</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {catalogueRequests.slice(0, 20).map((request) => (
              <tr key={request.id}>
                <td>
                  <b>{request.name}</b>
                  <div className="muted">{request.unit}</div>
                </td>
                <td>{request.seller.shopName}</td>
                <td>{request.categoryId}</td>
                <td><span className={statusClass(request.status)}>{request.status}</span></td>
                <td>{request.reason ?? "No reason"}</td>
                <td className="actions-cell">
                  {request.status === "PENDING" ? (
                    <>
                      <form action={approveProductRequest} className="inline-form">
                        <input type="hidden" name="requestId" value={request.id} />
                        <button className="button primary" type="submit">Approve</button>
                      </form>
                      <form action={rejectProductRequest} className="inline-form">
                        <input type="hidden" name="requestId" value={request.id} />
                        <input className="input compact" name="reason" placeholder="Reject reason" required />
                        <button className="button danger" type="submit">Reject</button>
                      </form>
                    </>
                  ) : (
                    <span className="muted">Reviewed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
