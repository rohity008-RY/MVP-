export const demoOrders = [
  {
    id: "demo-sub-1001-a",
    parentOrderId: "demo-order-1001",
    status: "PLACED",
    paymentState: "PAID",
    slaDueAt: new Date(Date.now() + 22 * 60_000).toISOString(),
    items: [{ productId: "tomato-hybrid", name: "Tomato Hybrid", qty: 2, price: 34 }, { productId: "milk-full-cream", name: "Full Cream Milk", qty: 1, price: 68 }]
  },
  {
    id: "demo-sub-1005-a",
    parentOrderId: "demo-order-1005",
    status: "HANDED_OVER",
    paymentState: "PAID",
    invoiceNumber: "BS-DEMO-L7XP",
    slaDueAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    items: [{ productId: "basmati-rice", name: "Basmati Rice", qty: 1, price: 145 }, { productId: "toor-dal", name: "Toor Dal", qty: 1, price: 168 }]
  }
];

export const demoProducts = [
  { id: "sp-tomato", active: true, qty: 5, price: 34, tags: ["Quick Delivery"], product: { id: "tomato-hybrid", name: "Tomato Hybrid", unit: "1 kg", hsn: "0702" } },
  { id: "sp-milk", active: true, qty: 22, price: 68, tags: ["Best Seller"], product: { id: "milk-full-cream", name: "Full Cream Milk", unit: "1 litre", hsn: "0401" } },
  { id: "sp-rice", active: true, qty: 18, price: 145, tags: ["Standard Delivery"], product: { id: "basmati-rice", name: "Basmati Rice", unit: "1 kg", hsn: "1006" } },
  { id: "sp-pickle", active: true, qty: 12, price: 149, tags: ["Best Seller"], product: { id: "mango-pickle", name: "Homemade Mango Pickle", unit: "250 g jar", hsn: "2106" } },
  { id: "sp-detergent", active: false, qty: 0, price: 112, tags: ["Inactive"], product: { id: "detergent-powder", name: "Detergent Powder", unit: "1 kg", hsn: "3402" } }
];

export const demoSupportTickets = [
  {
    id: "demo-ticket-seller-1",
    ticketNumber: "BST-DEMO-1004",
    source: "SELLER",
    status: "ASSIGNED",
    priority: "MEDIUM",
    category: "print_issue",
    subject: "80mm label text is not fitting",
    description: "Seller needs help printing the customer label in 80mm thermal size.",
    sellerId: "demo-seller-fresh",
    parentOrderId: "demo-order-1001",
    subOrderId: "demo-sub-1001-a",
    messages: [
      { id: "demo-seller-message-1", ticketId: "demo-ticket-seller-1", authorRole: "SELLER", visibility: "SELLER", message: "Thermal label is cutting customer address. Need alternate size.", createdAt: new Date(Date.now() - 28 * 60_000).toISOString() },
      { id: "demo-seller-message-2", ticketId: "demo-ticket-seller-1", authorRole: "SUPPORT", visibility: "SELLER", message: "Try 4x6 for this shipment while we inspect thermal formatting.", createdAt: new Date(Date.now() - 20 * 60_000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 28 * 60_000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60_000).toISOString()
  }
];

export function demoFallback(path: string) {
  const url = new URL(path, "http://demo.local");
  if (url.pathname === "/api/seller/demo-seller-fresh/orders") return demoOrders;
  if (url.pathname === "/api/seller/demo-seller-fresh/products") return demoProducts;
  if (url.pathname === "/api/seller/demo-seller-fresh/support-tickets") return demoSupportTickets;
  return undefined;
}
