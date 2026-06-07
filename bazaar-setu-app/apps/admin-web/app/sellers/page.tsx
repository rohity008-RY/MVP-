import { apiGet } from "../../lib/api";

type Seller = {
  id: string;
  ownerName: string;
  shopName: string;
  storeLive: boolean;
  selectedCategoryIds: string[];
  defaultSlaValue: number;
  defaultSlaUnit: string;
  autoInvoiceEnabled: boolean;
  deliveryFee: number;
  user: { phone: string; email?: string | null };
  locations: Array<{ label: string; city: string; openTime: string; closeTime: string }>;
  documents: Array<{ type: string; status: string }>;
  products: Array<{ id: string; active: boolean; qty: number }>;
};

export default async function SellersPage() {
  const sellers = await apiGet<Seller[]>("/api/admin/sellers");

  return (
    <>
      <div className="topbar">
        <div>
          <div className="eyebrow">Seller Ops</div>
          <h1 className="title">Seller onboarding and store control</h1>
        </div>
        <span className="pill">{sellers.length} sellers</span>
      </div>

      <section className="panel">
        <div className="panel-header">
          <span>Sellers</span>
          <span className="muted">Compliance, store live state, inventory, SLA</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Seller</th>
              <th>Store</th>
              <th>Categories</th>
              <th>SLA</th>
              <th>Documents</th>
              <th>Products</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller.id}>
                <td>
                  <b>{seller.ownerName}</b>
                  <div className="muted">{seller.user.phone}</div>
                </td>
                <td>
                  <span className={seller.storeLive ? "pill" : "pill danger"}>{seller.storeLive ? "Live" : "Disabled"}</span>
                  <div className="muted">{seller.shopName}</div>
                  <div className="muted">Delivery fee Rs {seller.deliveryFee}</div>
                </td>
                <td>{seller.selectedCategoryIds.join(", ")}</td>
                <td>
                  <b>{seller.defaultSlaValue} {seller.defaultSlaUnit}</b>
                  <div className="muted">{seller.autoInvoiceEnabled ? "Auto invoice on" : "Manual invoice"}</div>
                </td>
                <td>
                  {seller.documents.length ? seller.documents.map((doc) => (
                    <span className="pill warn" key={doc.type}>{doc.type}: {doc.status}</span>
                  )) : <span className="muted">No docs yet</span>}
                </td>
                <td>
                  <b>{seller.products.filter((product) => product.active).length}</b>
                  <div className="muted">live of {seller.products.length}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
