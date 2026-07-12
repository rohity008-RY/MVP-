const now = new Date();

function iso(minutesOffset: number) {
  return new Date(now.getTime() + minutesOffset * 60_000).toISOString();
}

export const demoDashboard = {
  totalOrders: 6,
  todayOrders: 5,
  todayRevenue: 2384,
  liveSellers: 3,
  disabledSellers: 1,
  pendingProductRequests: 2,
  pendingDocuments: 2,
  activeSubOrders: 4,
  breachedSla: 1,
  dueSoonSla: 2,
  pendingRefunds: 1,
  sellerLeads: 3,
  statusCounts: { PLACED: 1, INVOICE_REQUIRED: 1, BAG_PACKED: 1, HANDED_OVER: 1, DELIVERED: 1, REJECTED: 1, REFUNDED: 1 },
  paymentCounts: { PAID: 4, COD: 1, REFUND_PENDING: 1, REFUNDED: 1 }
};

export const demoOrders = [
  {
    id: "demo-order-1001",
    total: 299,
    deliveryFee: 68,
    paymentMethod: "upi",
    paymentState: "PAID",
    createdAt: iso(-18),
    address: { label: "Andheri (E)", city: "Mumbai", pincode: "400059" },
    subOrders: [
      {
        id: "demo-sub-1001-a",
        status: "PLACED",
        paymentState: "PAID",
        seller: { shopName: "Nirmala's Kitchen" },
        items: [{ id: "i1", name: "Tomato Hybrid", qty: 2, price: 34, hsn: "0702" }, { id: "i2", name: "Full Cream Milk", qty: 1, price: 68, hsn: "0401" }]
      },
      {
        id: "demo-sub-1001-b",
        status: "BAG_PACKED",
        paymentState: "PAID",
        invoiceNumber: "BS-DEMO-A91K",
        seller: { shopName: "Campus Quick Needs" },
        items: [{ id: "i3", name: "Masala Instant Noodles", qty: 3, price: 16, hsn: "1902" }, { id: "i4", name: "Cola Bottle", qty: 1, price: 40, hsn: "2202" }]
      }
    ]
  },
  {
    id: "demo-order-1002",
    total: 210,
    deliveryFee: 39,
    paymentMethod: "card",
    paymentState: "REFUND_PENDING",
    createdAt: iso(-76),
    address: { label: "BKC Office", city: "Mumbai", pincode: "400051" },
    subOrders: [
      {
        id: "demo-sub-1002-a",
        status: "REJECTED",
        paymentState: "REFUND_PENDING",
        rejectReason: "Fresh fish batch failed quality check.",
        seller: { shopName: "FreshCut Halal & Seafood" },
        items: [{ id: "i5", name: "Rohu Fish Steak", qty: 1, price: 210, hsn: "0302" }]
      }
    ]
  },
  {
    id: "demo-order-1004",
    total: 244,
    deliveryFee: 39,
    paymentMethod: "wallet",
    paymentState: "PAID",
    createdAt: iso(-38),
    address: { label: "BKC Office", city: "Mumbai", pincode: "400051" },
    subOrders: [
      {
        id: "demo-sub-1004-a",
        status: "INVOICE_REQUIRED",
        paymentState: "PAID",
        seller: { shopName: "FreshCut Halal & Seafood" },
        items: [{ id: "i6", name: "Chicken Curry Cut", qty: 1, price: 190, hsn: "0207" }, { id: "i7", name: "Farm Eggs", qty: 1, price: 54, hsn: "0407" }]
      }
    ]
  },
  {
    id: "demo-order-1005",
    total: 462,
    deliveryFee: 29,
    paymentMethod: "upi",
    paymentState: "PAID",
    createdAt: iso(-92),
    address: { label: "Andheri (E)", city: "Mumbai", pincode: "400059" },
    subOrders: [
      {
        id: "demo-sub-1005-a",
        status: "HANDED_OVER",
        paymentState: "PAID",
        invoiceNumber: "BS-DEMO-L7XP",
        seller: { shopName: "Nirmala's Kitchen" },
        items: [{ id: "i8", name: "Basmati Rice", qty: 1, price: 145, hsn: "1006" }, { id: "i9", name: "Toor Dal", qty: 1, price: 168, hsn: "0713" }, { id: "i10", name: "Homemade Mango Pickle", qty: 1, price: 149, hsn: "2106" }]
      }
    ]
  }
];

export const demoSlaOrders = [
  {
    id: "demo-sub-1005-a",
    status: "HANDED_OVER",
    paymentState: "PAID",
    invoiceNumber: "BS-DEMO-L7XP",
    slaDueAt: iso(-12),
    slaMinutesRemaining: -12,
    slaBreached: true,
    seller: { shopName: "Nirmala's Kitchen" },
    parentOrder: { customer: { user: { name: "Rahul Kumar", phone: "+919876543210" } } },
    items: [{ name: "Basmati Rice", qty: 1, price: 145 }, { name: "Toor Dal", qty: 1, price: 168 }]
  },
  {
    id: "demo-sub-1001-b",
    status: "BAG_PACKED",
    paymentState: "PAID",
    invoiceNumber: "BS-DEMO-A91K",
    slaDueAt: iso(10),
    slaMinutesRemaining: 10,
    slaBreached: false,
    seller: { shopName: "Campus Quick Needs" },
    parentOrder: { customer: { user: { name: "Rahul Kumar", phone: "+919876543210" } } },
    items: [{ name: "Masala Instant Noodles", qty: 3, price: 16 }]
  },
  {
    id: "demo-sub-1001-a",
    status: "PLACED",
    paymentState: "PAID",
    slaDueAt: iso(22),
    slaMinutesRemaining: 22,
    slaBreached: false,
    seller: { shopName: "Nirmala's Kitchen" },
    parentOrder: { customer: { user: { name: "Rahul Kumar", phone: "+919876543210" } } },
    items: [{ name: "Tomato Hybrid", qty: 2, price: 34 }, { name: "Full Cream Milk", qty: 1, price: 68 }]
  },
  {
    id: "demo-sub-1004-a",
    status: "INVOICE_REQUIRED",
    paymentState: "PAID",
    slaDueAt: iso(65),
    slaMinutesRemaining: 65,
    slaBreached: false,
    seller: { shopName: "FreshCut Halal & Seafood" },
    parentOrder: { customer: { user: { name: "Ria Shah", phone: "+919876543211" } } },
    items: [{ name: "Chicken Curry Cut", qty: 1, price: 190 }]
  }
];

export const demoRefunds = [
  {
    id: "demo-sub-1002-a",
    status: "REJECTED",
    paymentState: "REFUND_PENDING",
    refundAmount: 210,
    rejectReason: "Fresh fish batch failed quality check.",
    seller: { shopName: "FreshCut Halal & Seafood" },
    parentOrder: { customer: { user: { name: "Ria Shah", phone: "+919876543211" } } }
  },
  {
    id: "demo-sub-1006-a",
    status: "REFUNDED",
    paymentState: "REFUNDED",
    refundAmount: 155,
    rejectReason: "Store disabled during document review.",
    seller: { shopName: "Pooja Home Mart" },
    parentOrder: { customer: { user: { name: "Aman Verma", phone: "+919876543212" } } }
  }
];

export const demoSellers = [
  {
    id: "demo-seller-fresh",
    ownerName: "Nirmala Devi",
    shopName: "Nirmala's Kitchen",
    storeLive: true,
    opsState: "LIVE",
    selectedCategoryIds: ["vegetables", "dairy-eggs", "snacks", "packaged-food", "staples", "spices"],
    defaultSlaValue: 45,
    defaultSlaUnit: "minutes",
    autoInvoiceEnabled: true,
    deliveryFee: 29,
    pendingDocs: 0,
    rejectedDocs: 0,
    liveProducts: 12,
    user: { phone: "+919876544321", email: null },
    locations: [{ label: "Kurla Store", city: "Mumbai", openTime: "08:00", closeTime: "22:00" }],
    documents: [{ type: "FSSAI", status: "APPROVED" }, { type: "GSTIN", status: "APPROVED" }, { type: "BANK", status: "APPROVED" }],
    products: Array.from({ length: 12 }, (_, index) => ({ id: `fresh-${index}`, active: true, qty: 12 + index }))
  },
  {
    id: "demo-seller-meat",
    ownerName: "Imran Shaikh",
    shopName: "FreshCut Halal & Seafood",
    storeLive: true,
    opsState: "PENDING_DOC_REVIEW",
    selectedCategoryIds: ["meat-seafood", "dairy-eggs", "beverages"],
    defaultSlaValue: 2,
    defaultSlaUnit: "hours",
    autoInvoiceEnabled: false,
    deliveryFee: 39,
    pendingDocs: 1,
    rejectedDocs: 0,
    liveProducts: 5,
    user: { phone: "+919876544322", email: null },
    locations: [{ label: "Bandra Counter", city: "Mumbai", openTime: "10:00", closeTime: "21:30" }],
    documents: [{ type: "FSSAI", status: "PENDING" }, { type: "PAN", status: "APPROVED" }, { type: "BANK", status: "APPROVED" }],
    products: Array.from({ length: 5 }, (_, index) => ({ id: `meat-${index}`, active: true, qty: 6 + index }))
  },
  {
    id: "demo-seller-home",
    ownerName: "Pooja Mehta",
    shopName: "Pooja Home Mart",
    storeLive: false,
    opsState: "ACTION_REQUIRED",
    selectedCategoryIds: ["home-care", "household", "personal-care", "baby-care", "stationery", "pooja"],
    defaultSlaValue: 1,
    defaultSlaUnit: "days",
    autoInvoiceEnabled: true,
    deliveryFee: 19,
    pendingDocs: 1,
    rejectedDocs: 1,
    liveProducts: 7,
    user: { phone: "+919876544323", email: null },
    locations: [{ label: "Andheri Pickup", city: "Mumbai", openTime: "09:30", closeTime: "20:00" }],
    documents: [{ type: "GSTIN", status: "REJECTED" }, { type: "PAN", status: "APPROVED" }, { type: "BANK", status: "PENDING" }],
    products: Array.from({ length: 10 }, (_, index) => ({ id: `home-${index}`, active: index < 7, qty: 10 + index }))
  },
  {
    id: "demo-seller-campus",
    ownerName: "Arjun Rao",
    shopName: "Campus Quick Needs",
    storeLive: true,
    opsState: "LIVE",
    selectedCategoryIds: ["snacks", "beverages", "instant-food", "electronics-accessories", "fashion-basics", "footwear", "wellness"],
    defaultSlaValue: 30,
    defaultSlaUnit: "minutes",
    autoInvoiceEnabled: true,
    deliveryFee: 15,
    pendingDocs: 0,
    rejectedDocs: 0,
    liveProducts: 10,
    user: { phone: "+919876544324", email: null },
    locations: [{ label: "Powai Cart", city: "Mumbai", openTime: "07:00", closeTime: "23:30" }],
    documents: [{ type: "PAN", status: "APPROVED" }, { type: "BANK", status: "APPROVED" }],
    products: Array.from({ length: 10 }, (_, index) => ({ id: `campus-${index}`, active: true, qty: 20 + index }))
  }
];

export const demoCatalogueRequests = [
  { id: "demo-product-request-1", name: "Handmade Garlic Chutney", unit: "200 g jar", categoryId: "packaged-food", hsn: "2103", status: "PENDING", reason: null, imageUrl: "demo://garlic-chutney.jpg", createdAt: iso(-90), seller: { shopName: "Nirmala's Kitchen" } },
  { id: "demo-product-request-2", name: "Fast Charger 20W", unit: "1 pc", categoryId: "electronics-accessories", hsn: "8504", status: "PENDING", reason: null, imageUrl: "demo://charger-20w.jpg", createdAt: iso(-60), seller: { shopName: "Campus Quick Needs" } },
  { id: "demo-product-request-3", name: "Loose Phenyl Bottle", unit: "1 litre", categoryId: "home-care", hsn: "3808", status: "REJECTED", reason: "Label image missing MRP and manufacturer details.", imageUrl: "demo://phenyl.jpg", createdAt: iso(-180), seller: { shopName: "Pooja Home Mart" } }
];

export const demoNotifications = [
  { id: "demo-notification-offer", audience: "customer", type: "offer", title: "Fresh local deals are live", body: "Order from nearby sellers and earn 2x Bazaar Setu reward points today.", createdAt: iso(-40) },
  { id: "demo-notification-seller", audience: "seller", type: "system", title: "Peak hour alert", body: "Keep inventory updated between 6 PM and 9 PM to avoid stock-out cancellations.", createdAt: iso(-25) },
  { id: "demo-notification-refund", audience: "admin", type: "refund", title: "Refund desk review", body: "One prepaid rejected order is waiting for refund completion.", createdAt: iso(-10) }
];

export const demoLeads = [
  { id: "demo-seller-lead", name: "Rahul Kumar", phone: "+919876543210", notes: "Customer wants to onboard a weekend fruit stall.", status: "NEW", createdAt: iso(-140) },
  { id: "demo-seller-lead-2", name: "Ria Shah", phone: "+919876543211", notes: "Office pantry vendor interested in bulk snacks.", status: "CONTACTED", createdAt: iso(-210) },
  { id: "demo-seller-lead-3", name: "Aman Verma", phone: "+919876543212", notes: "Hostel laundry and essentials cart lead.", status: "NEW", createdAt: iso(-310) }
];

export const demoSettings = {
  paymentConfig: {
    vendors: [
      { id: "razorpay-upi", label: "UPI via Razorpay", enabled: true },
      { id: "razorpay-cards", label: "Cards via Razorpay", enabled: true },
      { id: "phonepe", label: "PhonePe PG", enabled: false },
      { id: "wallet", label: "Bazaar Setu Wallet", enabled: true },
      { id: "cod", label: "Cash on Delivery", enabled: true }
    ]
  },
  rewardConfig: { enabled: true, pointsPerHundred: 2, welcomeBonus: 25, sellerReferralBonus: 100 }
};

export const demoAuditLogs = [
  {
    id: "audit-demo-1",
    actorRole: "ADMIN",
    action: "notification_published",
    entityType: "Notification",
    entityId: "demo-notification-offer",
    metadata: { audience: "customer", type: "offer" },
    ipAddress: "127.0.0.1",
    createdAt: iso(-12)
  },
  {
    id: "audit-demo-2",
    actorRole: "ADMIN",
    action: "platform_settings_updated",
    entityType: "PlatformSetting",
    entityId: null,
    metadata: { rewardConfig: { enabled: true, pointsPerHundred: 2 } },
    ipAddress: "127.0.0.1",
    createdAt: iso(-22)
  },
  {
    id: "audit-demo-3",
    actorRole: "SUPPORT",
    action: "seller_lead_updated",
    entityType: "SellerLead",
    entityId: "demo-seller-lead",
    metadata: { status: "CONTACTED" },
    ipAddress: "127.0.0.1",
    createdAt: iso(-48)
  }
];

export function demoFallback(path: string) {
  const url = new URL(path, "http://demo.local");
  const pathname = url.pathname;
  if (pathname === "/api/ops/dashboard" || pathname === "/api/admin/dashboard") return demoDashboard;
  if (pathname === "/api/ops/sla") return demoSlaOrders;
  if (pathname === "/api/ops/refunds") return demoRefunds;
  if (pathname === "/api/ops/seller-verification" || pathname === "/api/admin/sellers") return demoSellers;
  if (pathname === "/api/ops/catalogue-requests" || pathname === "/api/admin/product-requests") return demoCatalogueRequests;
  if (pathname === "/api/admin/orders") return demoOrders;
  if (pathname === "/api/admin/notifications") return demoNotifications;
  if (pathname === "/api/admin/seller-leads") return demoLeads;
  if (pathname === "/api/admin/settings") return demoSettings;
  if (pathname === "/api/admin/audit-logs") return demoAuditLogs;
  if (pathname.startsWith("/api/admin/") || pathname.startsWith("/api/ops/")) return [];
  return undefined;
}
