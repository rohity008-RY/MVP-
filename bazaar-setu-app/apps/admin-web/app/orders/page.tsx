import { apiGet } from "../../lib/api";

type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  hsn?: string | null;
};

type SubOrder = {
  id: string;
  status: string;
  paymentState: string;
  invoiceNumber?: string | null;
  rejectReason?: string | null;
  seller: { shopName: string };
  items: OrderItem[];
};

type ParentOrder = {
  id: string;
  total: number;
  paymentMethod: string;
  paymentState: string;
  createdAt: string;
  address?: { label: string; city: string; pincode: string } | null;
  subOrders: SubOrder[];
};

function statusClass(status: string) {
  if (["REJECTED", "CANCELLED", "REFUND_PENDING"].includes(status)) return "pill danger";
  if (["INVOICE_REQUIRED", "BAG_PACKED"].includes(status)) return "pill warn";
  return "pill";
}

export default async function OrdersPage() {
  const orders = await apiGet<ParentOrder[]>("/api/admin/orders");

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow">Order Monitoring</div>
          <h1 className="title">Parent orders and seller sub-orders</h1>
        </div>
        <span className="pill">{orders.length} orders</span>
      </div>

      <section className="panel">
        <div className="panel-header">
          <span>Orders</span>
          <span className="muted">SLA, refund, invoice, and split-order view</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer Address</th>
              <th>Payment</th>
              <th>Sub Orders</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <b>{order.id.slice(0, 8)}</b>
                  <div className="muted">{new Date(order.createdAt).toLocaleString("en-IN")}</div>
                </td>
                <td>
                  {order.address?.label ?? "No label"}
                  <div className="muted">{order.address?.city} {order.address?.pincode}</div>
                </td>
                <td>
                  <span className="pill">{order.paymentMethod.toUpperCase()}</span>
                  <div className="muted">{order.paymentState}</div>
                </td>
                <td>
                  <div className="suborder-list">
                    {order.subOrders.map((subOrder) => (
                      <div className="suborder" key={subOrder.id}>
                        <div>
                          <b>{subOrder.seller.shopName}</b>
                          <span>{subOrder.items.map((item) => `${item.name} x${item.qty}`).join(", ")}</span>
                        </div>
                        <span className={statusClass(subOrder.status)}>{subOrder.status.replaceAll("_", " ")}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td><b>Rs {order.total}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
