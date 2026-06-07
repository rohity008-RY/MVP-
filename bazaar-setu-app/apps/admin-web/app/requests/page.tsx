import { apiGet } from "../../lib/api";

type ProductRequest = {
  id: string;
  name: string;
  categoryId: string;
  unit: string;
  hsn?: string | null;
  status: string;
  reason?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  seller: { shopName: string };
};

export default async function ProductRequestsPage() {
  const requests = await apiGet<ProductRequest[]>("/api/admin/product-requests");

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow">Catalogue Governance</div>
          <h1 className="title">New product approval queue</h1>
        </div>
        <span className="pill warn">{requests.filter((request) => request.status === "PENDING").length} pending</span>
      </div>

      <section className="panel">
        <div className="panel-header">
          <span>Requests</span>
          <span className="muted">Approve adds to master catalogue, reject requires reason in API</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Seller</th>
              <th>Category</th>
              <th>Compliance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>
                  <b>{request.name}</b>
                  <div className="muted">{request.unit}</div>
                  <div className="muted">{new Date(request.createdAt).toLocaleString("en-IN")}</div>
                </td>
                <td>{request.seller.shopName}</td>
                <td>{request.categoryId}</td>
                <td>
                  <span className="pill">{request.hsn ? `HSN ${request.hsn}` : "HSN optional"}</span>
                  <div className="muted">{request.imageUrl ? "Photo attached" : "No photo"}</div>
                </td>
                <td>
                  <span className={request.status === "REJECTED" ? "pill danger" : request.status === "PENDING" ? "pill warn" : "pill"}>
                    {request.status}
                  </span>
                  {request.reason ? <div className="muted">Reason: {request.reason}</div> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
