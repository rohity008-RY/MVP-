export const demoHome = {
  categories: [
    { id: "vegetables", name: "Vegetables", icon: "leaf" },
    { id: "fruits", name: "Fruits", icon: "apple" },
    { id: "dairy-eggs", name: "Dairy & Eggs", icon: "milk" },
    { id: "snacks", name: "Snacks", icon: "snack" },
    { id: "staples", name: "Staples", icon: "rice" },
    { id: "home-care", name: "Home Care", icon: "clean" }
  ],
  products: [
    { id: "tomato-hybrid", categoryId: "vegetables", name: "Tomato Hybrid", unit: "1 kg", hsn: "0702", legalMetrology: { mrp: 34 }, sellerProducts: [{ id: "demo-offer-demo-seller-fresh-tomato-hybrid", price: 34 }] },
    { id: "milk-full-cream", categoryId: "dairy-eggs", name: "Full Cream Milk", unit: "1 litre", hsn: "0401", legalMetrology: { mrp: 68 }, sellerProducts: [{ id: "demo-offer-demo-seller-fresh-milk-full-cream", price: 68 }] },
    { id: "basmati-rice", categoryId: "staples", name: "Basmati Rice", unit: "1 kg", hsn: "1006", legalMetrology: { mrp: 145 }, sellerProducts: [{ id: "demo-offer-demo-seller-fresh-basmati-rice", price: 145 }] },
    { id: "instant-noodles", categoryId: "instant-food", name: "Masala Instant Noodles", unit: "70 g", hsn: "1902", legalMetrology: { mrp: 16 }, sellerProducts: [{ id: "demo-offer-demo-seller-campus-instant-noodles", price: 16 }] },
    { id: "chips-salted", categoryId: "snacks", name: "Classic Salted Chips", unit: "52 g", hsn: "2005", legalMetrology: { mrp: 20 }, sellerProducts: [{ id: "demo-offer-demo-seller-campus-chips-salted", price: 20 }] },
    { id: "floor-cleaner", categoryId: "home-care", name: "Floor Cleaner", unit: "1 litre", hsn: "3402", legalMetrology: { mrp: 165 }, sellerProducts: [{ id: "demo-offer-demo-seller-home-floor-cleaner", price: 165 }] }
  ]
};

export const demoOrders = [
  {
    id: "demo-order-1001",
    status: "PLACED",
    paymentState: "PAID",
    total: 299,
    subOrders: [
      { id: "demo-sub-1001-a", status: "PLACED" },
      { id: "demo-sub-1001-b", status: "BAG_PACKED" }
    ]
  },
  {
    id: "demo-order-1005",
    status: "CONFIRMED",
    paymentState: "PAID",
    total: 462,
    subOrders: [{ id: "demo-sub-1005-a", status: "HANDED_OVER" }]
  }
];

export const demoAddresses = [
  { id: "demo-home-address", type: "home", label: "Home", line1: "Home - 17, Namam Premier, Marol", city: "Mumbai", state: "Maharashtra", pincode: "400059", lat: 19.1197, lng: 72.8468 },
  { id: "demo-office-address", type: "office", label: "Office", line1: "Tower B, Bandra Kurla Complex", city: "Mumbai", state: "Maharashtra", pincode: "400051", lat: 19.0676, lng: 72.8676 }
];

export const demoConfig = {
  paymentConfig: {
    vendors: [
      { id: "razorpay-upi", label: "UPI via Razorpay", enabled: true },
      { id: "razorpay-cards", label: "Cards via Razorpay", enabled: true },
      { id: "wallet", label: "Bazaar Setu Wallet", enabled: true },
      { id: "cod", label: "Cash on Delivery", enabled: true }
    ]
  },
  rewardConfig: { enabled: true, pointsPerHundred: 1 }
};

export function demoFallback(path: string) {
  const url = new URL(path, "http://demo.local");
  if (url.pathname === "/api/customer/home") return demoHome;
  if (url.pathname === "/api/customer/config") return demoConfig;
  if (url.pathname === "/api/customer/demo-customer/orders") return demoOrders;
  if (url.pathname === "/api/customer/demo-customer/addresses") return demoAddresses;
  return undefined;
}
