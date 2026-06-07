const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { config } = require("./config");

const DATA_FILE = config.dataFile || path.join(__dirname, "data", "db.json");

function id(prefix) {
  return `${prefix}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

const categories = [
  ["fruits", "Fruits", "Apple", "#FAEEDA"],
  ["vegetables", "Vegetables", "Leaf", "#E1F5EE"],
  ["dairy", "Dairy & Eggs", "Milk", "#E6F1FB"],
  ["meat", "Meat & Seafood", "Meat", "#FCEBEB"],
  ["bakery", "Bakery", "Bread", "#FBEAF0"],
  ["snacks", "Snacks", "Snack", "#FAEEDA"],
  ["beverages", "Beverages", "Drink", "#E6F1FB"],
  ["staples", "Staples", "Rice", "#F8E7D6"],
  ["pulses", "Pulses & Dal", "Dal", "#EAF3DE"],
  ["spices", "Masala & Spices", "Spice", "#FAECE7"],
  ["packaged-food", "Packaged Food", "Jar", "#EEEDFE"],
  ["home-care", "Home Care", "Clean", "#E1F5EE"],
  ["personal-care", "Personal Care", "Care", "#FBEAF0"],
  ["pooja", "Pooja Items", "Diya", "#FAEEDA"]
].map(([categoryId, name, icon, color]) => ({ id: categoryId, name, icon, color }));

const productSeed = [
  ["tomato", "Tomato Hybrid", "vegetables", "Fresh Vegetables", "1 kg", "0702", 34, "Tomato"],
  ["potato", "Potato Agra", "vegetables", "Root Vegetables", "1 kg", "0701", 31, "Potato"],
  ["onion", "Onion Nashik", "vegetables", "Root Vegetables", "1 kg", "0703", 42, "Onion"],
  ["spinach", "Fresh Spinach", "vegetables", "Leafy Greens", "1 bunch", "0709", 28, "Spinach"],
  ["apple", "Apple Shimla", "fruits", "Apples", "1 kg", "0808", 180, "Apple"],
  ["banana", "Banana Robusta", "fruits", "Banana", "1 dozen", "0803", 62, "Banana"],
  ["mango", "Alphonso Mango", "fruits", "Mangoes", "1 kg", "0804", 240, "Mango"],
  ["milk", "Full Cream Milk", "dairy", "Milk", "1 litre", "0401", 68, "Milk"],
  ["curd", "Fresh Curd", "dairy", "Curd", "500 g", "0403", 52, "Curd"],
  ["paneer", "Paneer Fresh", "dairy", "Paneer", "200 g", "0406", 92, "Paneer"],
  ["eggs", "Farm Eggs", "dairy", "Eggs", "12 pcs", "0407", 84, "Eggs"],
  ["chicken", "Chicken Curry Cut", "meat", "Chicken", "500 g", "0207", 190, "Chicken"],
  ["fish", "Fish Rohu Cut", "meat", "Fish", "500 g", "0303", 210, "Fish"],
  ["bread", "Multigrain Bread", "bakery", "Bread", "400 g loaf", "1905", 55, "Bread"],
  ["pav", "Pav Pack", "bakery", "Pav", "6 pcs", "1905", 36, "Pav"],
  ["chips", "Classic Salted Chips", "snacks", "Chips", "52 g", "2005", 20, "Chips"],
  ["bhujia", "Aloo Bhujia", "snacks", "Namkeen", "200 g", "2106", 68, "Bhujia"],
  ["cola", "Cola Bottle", "beverages", "Soft Drinks", "750 ml", "2202", 40, "Cola"],
  ["water", "Packaged Drinking Water", "beverages", "Water", "1 litre", "2201", 20, "Water"],
  ["rice", "Basmati Rice", "staples", "Rice", "1 kg", "1006", 145, "Rice"],
  ["atta", "Wheat Atta", "staples", "Flour", "5 kg", "1101", 235, "Atta"],
  ["toor-dal", "Toor Dal", "pulses", "Dal", "1 kg", "0713", 168, "Dal"],
  ["turmeric", "Turmeric Powder", "spices", "Powdered Spices", "100 g", "0910", 44, "Haldi"],
  ["mango-pickle", "Homemade Mango Pickle", "packaged-food", "Pickles", "250 g jar", "2106", 149, "Pickle"],
  ["noodles", "Instant Noodles", "packaged-food", "Noodles", "280 g", "1902", 62, "Noodles"],
  ["detergent", "Detergent Powder", "home-care", "Laundry", "1 kg", "3402", 112, "Detergent"],
  ["soap", "Bath Soap", "personal-care", "Soap", "4 x 75 g", "3401", 96, "Soap"],
  ["agarbatti", "Agarbatti Sandal", "pooja", "Incense", "100 sticks", "3307", 65, "Agarbatti"]
];

const products = productSeed.map(([productId, name, categoryId, subcategory, unit, hsn, mrp, imageText]) => ({
  id: productId,
  name,
  categoryId,
  subcategory,
  unit,
  hsn,
  gstRate: hsn ? "As applicable" : "",
  legalMetrology: {
    netQuantity: unit,
    origin: "India",
    consumerCare: "Bazaar Setu Support"
  },
  imageText,
  imageColor: categories.find((category) => category.id === categoryId)?.color || "#F2F0EC",
  mrp,
  aliases: [name.toLowerCase(), subcategory.toLowerCase(), categoryId.replace("-", " ")]
}));

const seedDb = {
  version: 1,
  users: [
    { id: "customer-1", role: "customer", name: "Rahul Kumar", phone: "+91 98765 43210" },
    { id: "seller-1", role: "seller", name: "Nirmala Devi", phone: "+91 98765 44321" },
    { id: "admin-1", role: "admin", name: "Suresh Admin", phone: "+91 90000 00000" }
  ],
  categories,
  products,
  customerProfiles: {
    "customer-1": {
      id: "customer-1",
      name: "Rahul Kumar",
      phone: "+91 98765 43210",
      rewardPoints: 320,
      addresses: [
        { id: "addr-home", type: "Home", label: "Andheri (E)", line: "Home - 17, Namam Premier, Marol", lat: 19.1197, lng: 72.8468 },
        { id: "addr-office", type: "Office", label: "BKC Office", line: "Maker Maxity, Bandra Kurla Complex", lat: 19.0596, lng: 72.8656 }
      ]
    }
  },
  sellerProfiles: {
    "seller-1": {
      id: "seller-1",
      ownerName: "Nirmala Devi",
      shopName: "Nirmala's Kitchen",
      phone: "+91 98765 44321",
      email: "nirmala@example.com",
      address: "Kurla West, Mumbai",
      lat: 19.0726,
      lng: 72.8845,
      selectedCategoryIds: ["vegetables", "dairy", "snacks", "packaged-food"],
      storeLive: true,
      storeStart: "09:00",
      storeEnd: "21:00",
      slaValue: 45,
      slaUnit: "min",
      autoInvoice: true,
      deliveryFee: 29,
      documents: {
        fssai: "11223344556677",
        gstin: "27ABCDE1234F1Z5",
        pan: "ABCDE1234F",
        bank: "HDFC ****4821",
        upi: "nirmala@upi"
      }
    }
  },
  sellerProducts: [
    { id: "sp-1", sellerId: "seller-1", productId: "mango-pickle", price: 149, qty: 8, active: true, tags: ["Quick Delivery"], slaOverride: "" },
    { id: "sp-2", sellerId: "seller-1", productId: "spinach", price: 32, qty: 16, active: true, tags: ["Fresh"], slaOverride: "" },
    { id: "sp-3", sellerId: "seller-1", productId: "milk", price: 68, qty: 30, active: true, tags: ["Daily"], slaOverride: "" }
  ],
  productRequests: [
    { id: "REQ-1001", sellerId: "seller-1", name: "Homemade Lemon Pickle", categoryId: "packaged-food", unit: "250 g jar", hsn: "2106", photoUrl: "", status: "Pending", reason: "", createdAt: "Today" }
  ],
  orders: [
    {
      id: "ORD-1001",
      customerId: "customer-1",
      addressId: "addr-home",
      paymentMethod: "upi",
      paymentState: "Paid",
      status: "Placed",
      total: 298,
      createdAt: "Today 09:12",
      subOrders: [
        {
          id: "SUB-1001-A",
          sellerId: "seller-1",
          status: "Placed",
          invoiceNumber: "",
          invoiceMode: "",
          refundState: "",
          rejectReason: "",
          timeline: [{ status: "Placed", at: "Today 09:12" }],
          items: [{ productId: "mango-pickle", name: "Homemade Mango Pickle", qty: 2, price: 149, hsn: "2106" }]
        }
      ]
    }
  ],
  notifications: [
    { id: "NTF-1", audience: "customer", type: "offer", title: "Welcome to Bazaar Setu", body: "Fresh local sellers are live near you.", readBy: [], createdAt: "Today", source: "Admin" },
    { id: "NTF-2", audience: "seller", type: "system", title: "Complete profile", body: "Keep store timing and SLA updated for better order promise.", readBy: [], createdAt: "Today", source: "Admin" }
  ],
  settings: {
    paymentMethods: {
      upi: { label: "UPI", vendor: "Razorpay", enabled: true },
      card: { label: "Cards", vendor: "Cashfree", enabled: true },
      wallet: { label: "Wallet", vendor: "BazaarPay", enabled: true },
      cod: { label: "Cash on Delivery", vendor: "COD", enabled: true }
    },
    rewards: { enabled: true, earnRs: 100, points: 10 }
  }
};

function ensureDb() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedDb, null, 2));
  }
}

function loadDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveDb(db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  return db;
}

function resetDb() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(seedDb, null, 2));
  return loadDb();
}

module.exports = { DATA_FILE, id, loadDb, saveDb, resetDb };
