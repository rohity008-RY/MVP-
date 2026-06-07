const STORAGE_KEY = "bazaarSetuStaticState.v1";

if (new URLSearchParams(window.location.search).has("resetState")) {
  localStorage.removeItem(STORAGE_KEY);
}

const masterCategories = [
  { id: "fruits", label: "Fruits", icon: "ti ti-apple", color: "#FAEEDA", emoji: "🍎" },
  { id: "vegetables", label: "Vegetables", icon: "ti ti-leaf", color: "#E1F5EE", emoji: "🥬" },
  { id: "dairy", label: "Dairy & Eggs", icon: "ti ti-milk", color: "#E6F1FB", emoji: "🥛" },
  { id: "meat", label: "Meat & Seafood", icon: "ti ti-meat", color: "#FCEBEB", emoji: "🥩" },
  { id: "bakery", label: "Bakery", icon: "ti ti-bread", color: "#FBEAF0", emoji: "🍞" },
  { id: "snacks", label: "Snacks", icon: "ti ti-cookie", color: "#FAEEDA", emoji: "🍿" },
  { id: "beverages", label: "Beverages", icon: "ti ti-coffee", color: "#E6F1FB", emoji: "🧃" },
  { id: "staples", label: "Staples", icon: "ti ti-bowl", color: "#F8E7D6", emoji: "🍚" },
  { id: "pulses", label: "Pulses & Dal", icon: "ti ti-seedling", color: "#EAF3DE", emoji: "🫘" },
  { id: "spices", label: "Masala & Spices", icon: "ti ti-pepper", color: "#FAECE7", emoji: "🌶️" },
  { id: "packaged-food", label: "Packaged Food", icon: "ti ti-package", color: "#EEEDFE", emoji: "🫙" },
  { id: "personal-care", label: "Personal Care", icon: "ti ti-spray", color: "#FBEAF0", emoji: "🧴" },
  { id: "baby-care", label: "Baby Care", icon: "ti ti-baby-carriage", color: "#E6F1FB", emoji: "🍼" },
  { id: "home-care", label: "Home Care", icon: "ti ti-wash", color: "#E1F5EE", emoji: "🧽" },
  { id: "household", label: "Household", icon: "ti ti-home", color: "#F2F0EC", emoji: "🧺" },
  { id: "stationery", label: "Stationery", icon: "ti ti-pencil", color: "#EEEDFE", emoji: "✏️" },
  { id: "pet-care", label: "Pet Care", icon: "ti ti-paw", color: "#FAEEDA", emoji: "🐾" },
  { id: "electronics", label: "Electronics Accessories", icon: "ti ti-device-mobile", color: "#E6F1FB", emoji: "🔌" },
  { id: "fashion", label: "Fashion Basics", icon: "ti ti-shirt", color: "#FBEAF0", emoji: "👕" },
  { id: "footwear", label: "Footwear", icon: "ti ti-shoe", color: "#F2F0EC", emoji: "👟" },
  { id: "pooja", label: "Pooja Items", icon: "ti ti-flame", color: "#FAEEDA", emoji: "🪔" },
  { id: "wellness", label: "Pharmacy & Wellness", icon: "ti ti-first-aid-kit", color: "#E1F5EE", emoji: "💊" }
];

const categories = [{ id: "all", label: "All", icon: "ti ti-layout-grid", color: "#F2F0EC", emoji: "🛒" }, ...masterCategories];

const sellers = [
  {
    id: "ram",
    initials: "RF",
    name: "Ram Fresh Farms",
    meta: "Vegetables · Fruits",
    rating: "4.8 · 2.3k orders",
    color: "#ff4b2b",
    eta: "30-45 min"
  },
  {
    id: "om",
    initials: "OD",
    name: "Om Dairy Hub",
    meta: "Dairy · Eggs",
    rating: "4.6 · 1.8k orders",
    color: "#185fa5",
    eta: "20-35 min"
  },
  {
    id: "sharma",
    initials: "SB",
    name: "Sharma Bakery",
    meta: "Bakery · Sweets",
    rating: "4.9 · 3.1k orders",
    color: "#0f6e56",
    eta: "35-50 min"
  }
];

const products = [
  {
    id: "broccoli",
    name: "Broccoli Crown",
    category: "vegetables",
    sellerId: "ram",
    icon: "🥦",
    unit: "500 g",
    price: 58,
    oldPrice: 72,
    badge: "20% OFF",
    color: "#E1F5EE",
    tags: ["fresh", "greens", "vegetables", "hsn 0704"]
  },
  {
    id: "oranges",
    name: "Nagpur Oranges",
    category: "fruits",
    sellerId: "ram",
    icon: "🍊",
    unit: "1 kg",
    price: 95,
    oldPrice: 120,
    badge: "FRESH",
    color: "#FAEEDA",
    tags: ["orange", "fruit", "citrus"]
  },
  {
    id: "milk",
    name: "Full Cream Milk",
    category: "dairy",
    sellerId: "om",
    icon: "🥛",
    unit: "1 litre",
    price: 68,
    badge: "NEW",
    color: "#E6F1FB",
    tags: ["milk", "dairy", "fssai"]
  },
  {
    id: "bread",
    name: "Multigrain Bread",
    category: "bakery",
    sellerId: "sharma",
    icon: "🍞",
    unit: "400 g loaf",
    price: 55,
    oldPrice: 65,
    badge: "FRESH",
    color: "#FBEAF0",
    tags: ["bakery", "bread", "breakfast"]
  },
  {
    id: "eggs",
    name: "Farm Eggs",
    category: "dairy",
    sellerId: "om",
    icon: "🥚",
    unit: "12 pcs",
    price: 84,
    badge: "FRESH",
    color: "#EAF3DE",
    tags: ["eggs", "protein", "dairy"]
  },
  {
    id: "spinach",
    name: "Fresh Spinach",
    category: "vegetables",
    sellerId: "ram",
    icon: "🥬",
    unit: "1 bunch",
    price: 32,
    oldPrice: 44,
    color: "#E1F5EE",
    tags: ["palak", "greens", "vegetables"]
  }
];

const catalogueSeed = {
  fruits: [
    ["Apple Shimla", "Apples", "1 kg", "0808", "apple|seb"],
    ["Banana Robusta", "Banana", "1 dozen", "0803", "banana|kela"],
    ["Nagpur Oranges", "Citrus", "1 kg", "0805", "orange|santra"],
    ["Pomegranate Premium", "Seasonal Fruits", "500 g", "0810", "anar|pomegranate"],
    ["Papaya Ripe", "Tropical Fruits", "1 pc", "0807", "papaya|papita"],
    ["Watermelon Kiran", "Melons", "1 pc", "0807", "watermelon|tarbooj"],
    ["Green Grapes", "Grapes", "500 g", "0806", "grapes|angoor"],
    ["Alphonso Mango", "Mangoes", "1 kg", "0804", "mango|aam"]
  ],
  vegetables: [
    ["Tomato Hybrid", "Fresh Vegetables", "1 kg", "0702", "tomato|tamatar"],
    ["Potato Agra", "Root Vegetables", "1 kg", "0701", "potato|aloo"],
    ["Onion Nashik", "Root Vegetables", "1 kg", "0703", "onion|pyaz"],
    ["Fresh Spinach", "Leafy Greens", "1 bunch", "0709", "spinach|palak"],
    ["Broccoli Crown", "Exotic Vegetables", "500 g", "0704", "broccoli"],
    ["Cauliflower", "Fresh Vegetables", "1 pc", "0704", "cauliflower|gobi"],
    ["Green Peas", "Fresh Vegetables", "500 g", "0708", "peas|matar"],
    ["Coriander Leaves", "Herbs", "100 g", "0709", "coriander|dhaniya"]
  ],
  dairy: [
    ["Full Cream Milk", "Milk", "1 litre", "0401", "milk|doodh"],
    ["Toned Milk", "Milk", "1 litre", "0401", "toned milk"],
    ["Fresh Curd", "Curd", "500 g", "0403", "curd|dahi"],
    ["Paneer Fresh", "Paneer", "200 g", "0406", "paneer"],
    ["Butter Salted", "Butter", "100 g", "0405", "butter"],
    ["Cheese Slices", "Cheese", "200 g", "0406", "cheese"],
    ["Farm Eggs", "Eggs", "12 pcs", "0407", "egg|anda"],
    ["Ghee Cow", "Ghee", "500 ml", "0405", "ghee"]
  ],
  meat: [
    ["Chicken Curry Cut", "Chicken", "500 g", "0207", "chicken"],
    ["Chicken Breast Boneless", "Chicken", "450 g", "0207", "chicken breast"],
    ["Mutton Curry Cut", "Mutton", "500 g", "0204", "mutton"],
    ["Fish Rohu Cut", "Fish", "500 g", "0303", "fish|rohu"],
    ["Prawns Medium", "Seafood", "250 g", "0306", "prawns"],
    ["Chicken Sausages", "Processed Meat", "250 g", "1601", "sausages"],
    ["Egg White Pack", "Eggs", "6 pcs", "0407", "egg white"],
    ["Fish Fillet Basa", "Fish", "400 g", "0304", "basa"]
  ],
  bakery: [
    ["Multigrain Bread", "Bread", "400 g loaf", "1905", "bread"],
    ["White Sandwich Bread", "Bread", "400 g loaf", "1905", "white bread"],
    ["Brown Bread", "Bread", "400 g loaf", "1905", "brown bread"],
    ["Pav Pack", "Pav", "6 pcs", "1905", "pav"],
    ["Burger Buns", "Buns", "4 pcs", "1905", "burger bun"],
    ["Khari Biscuit", "Bakery Snacks", "200 g", "1905", "khari"],
    ["Rusk Elaichi", "Rusk", "200 g", "1905", "rusk"],
    ["Chocolate Muffin", "Cakes", "2 pcs", "1905", "muffin"]
  ],
  snacks: [
    ["Classic Salted Chips", "Chips", "52 g", "2005", "chips"],
    ["Masala Chips", "Chips", "52 g", "2005", "masala chips"],
    ["Aloo Bhujia", "Namkeen", "200 g", "2106", "bhujia|namkeen"],
    ["Moong Dal Namkeen", "Namkeen", "200 g", "2106", "moong dal"],
    ["Popcorn Butter", "Popcorn", "90 g", "1904", "popcorn"],
    ["Cream Biscuits", "Biscuits", "150 g", "1905", "biscuits"],
    ["Marie Biscuits", "Biscuits", "250 g", "1905", "marie"],
    ["Roasted Makhana", "Healthy Snacks", "80 g", "1904", "makhana"]
  ],
  beverages: [
    ["Cola Bottle", "Soft Drinks", "750 ml", "2202", "cola"],
    ["Lemon Soda", "Soft Drinks", "750 ml", "2202", "soda"],
    ["Mango Drink", "Juice", "1 litre", "2202", "mango juice"],
    ["Mixed Fruit Juice", "Juice", "1 litre", "2202", "juice"],
    ["Packaged Drinking Water", "Water", "1 litre", "2201", "water"],
    ["Green Tea Bags", "Tea", "25 bags", "0902", "green tea"],
    ["Instant Coffee", "Coffee", "50 g", "2101", "coffee"],
    ["Energy Drink", "Energy Drinks", "250 ml", "2202", "energy drink"]
  ],
  staples: [
    ["Basmati Rice", "Rice", "1 kg", "1006", "rice|chawal"],
    ["Sona Masoori Rice", "Rice", "1 kg", "1006", "rice"],
    ["Wheat Atta", "Flour", "5 kg", "1101", "atta"],
    ["Maida", "Flour", "1 kg", "1101", "maida"],
    ["Rava Sooji", "Flour", "500 g", "1103", "rava|sooji"],
    ["Poha Thick", "Breakfast Staples", "1 kg", "1904", "poha"],
    ["Sugar", "Sugar", "1 kg", "1701", "sugar"],
    ["Jaggery Powder", "Sweeteners", "500 g", "1701", "jaggery|gur"]
  ],
  pulses: [
    ["Toor Dal", "Dal", "1 kg", "0713", "toor dal|arhar"],
    ["Moong Dal", "Dal", "1 kg", "0713", "moong"],
    ["Chana Dal", "Dal", "1 kg", "0713", "chana dal"],
    ["Masoor Dal", "Dal", "1 kg", "0713", "masoor"],
    ["Urad Dal", "Dal", "1 kg", "0713", "urad"],
    ["Rajma Red", "Beans", "500 g", "0713", "rajma"],
    ["Kabuli Chana", "Chickpeas", "500 g", "0713", "chana"],
    ["Black Chana", "Chickpeas", "500 g", "0713", "black chana"]
  ],
  spices: [
    ["Turmeric Powder", "Powdered Spices", "100 g", "0910", "haldi|turmeric"],
    ["Red Chilli Powder", "Powdered Spices", "100 g", "0904", "mirchi|chilli"],
    ["Coriander Powder", "Powdered Spices", "100 g", "0909", "dhaniya"],
    ["Cumin Seeds", "Whole Spices", "100 g", "0909", "jeera|cumin"],
    ["Mustard Seeds", "Whole Spices", "100 g", "1207", "rai|mustard"],
    ["Garam Masala", "Blended Spices", "100 g", "0910", "garam masala"],
    ["Kitchen King Masala", "Blended Spices", "100 g", "0910", "kitchen king"],
    ["Black Pepper", "Whole Spices", "50 g", "0904", "pepper"]
  ],
  "packaged-food": [
    ["Homemade Mango Pickle", "Pickles", "250 g jar", "2106", "mango pickle|achar"],
    ["Mixed Veg Pickle", "Pickles", "250 g jar", "2106", "pickle"],
    ["Tomato Ketchup", "Sauces", "500 g", "2103", "ketchup"],
    ["Instant Noodles", "Noodles", "280 g", "1902", "noodles"],
    ["Pasta Penne", "Pasta", "500 g", "1902", "pasta"],
    ["Corn Flakes", "Breakfast Cereal", "475 g", "1904", "cereal"],
    ["Jam Mixed Fruit", "Spreads", "500 g", "2007", "jam"],
    ["Peanut Butter", "Spreads", "340 g", "2008", "peanut butter"]
  ],
  "personal-care": [
    ["Bath Soap", "Soap", "4 x 75 g", "3401", "soap"],
    ["Shampoo", "Hair Care", "180 ml", "3305", "shampoo"],
    ["Toothpaste", "Oral Care", "150 g", "3306", "toothpaste"],
    ["Toothbrush", "Oral Care", "1 pc", "9603", "toothbrush"],
    ["Face Wash", "Skin Care", "100 ml", "3304", "face wash"],
    ["Body Lotion", "Skin Care", "200 ml", "3304", "lotion"],
    ["Hair Oil", "Hair Care", "200 ml", "3305", "hair oil"],
    ["Sanitary Pads", "Hygiene", "20 pads", "9619", "pads"]
  ],
  "baby-care": [
    ["Baby Diapers M", "Diapers", "30 pcs", "9619", "diaper"],
    ["Baby Wipes", "Wipes", "72 pcs", "3401", "wipes"],
    ["Baby Lotion", "Skin Care", "200 ml", "3304", "baby lotion"],
    ["Baby Shampoo", "Hair Care", "200 ml", "3305", "baby shampoo"],
    ["Baby Soap", "Soap", "75 g", "3401", "baby soap"],
    ["Infant Cereal", "Baby Food", "300 g", "1901", "baby food"],
    ["Feeding Bottle", "Accessories", "250 ml", "3924", "feeding bottle"],
    ["Baby Powder", "Skin Care", "200 g", "3304", "baby powder"]
  ],
  "home-care": [
    ["Detergent Powder", "Laundry", "1 kg", "3402", "detergent"],
    ["Liquid Detergent", "Laundry", "1 litre", "3402", "liquid detergent"],
    ["Dishwash Bar", "Dish Cleaning", "300 g", "3405", "dishwash"],
    ["Dishwash Liquid", "Dish Cleaning", "500 ml", "3402", "dishwash liquid"],
    ["Floor Cleaner", "Floor Cleaning", "1 litre", "3402", "floor cleaner"],
    ["Toilet Cleaner", "Bathroom Cleaning", "500 ml", "3402", "toilet cleaner"],
    ["Glass Cleaner", "Surface Cleaning", "500 ml", "3402", "glass cleaner"],
    ["Garbage Bags", "Waste Bags", "30 bags", "3923", "garbage bags"]
  ],
  household: [
    ["Steel Scrubber", "Cleaning Tools", "3 pcs", "7323", "scrubber"],
    ["Microfiber Cloth", "Cleaning Tools", "4 pcs", "6307", "cloth"],
    ["Aluminium Foil", "Kitchen Utility", "9 m", "7607", "foil"],
    ["Food Storage Container", "Storage", "1 pc", "3924", "container"],
    ["Paper Napkins", "Disposables", "100 pulls", "4818", "napkins"],
    ["Tissue Roll", "Disposables", "4 rolls", "4818", "tissue"],
    ["Broom Grass", "Cleaning Tools", "1 pc", "9603", "broom"],
    ["Mop Refill", "Cleaning Tools", "1 pc", "9603", "mop"]
  ],
  stationery: [
    ["Ball Pens Blue", "Writing", "10 pcs", "9608", "pen"],
    ["Notebook A4", "Notebooks", "1 pc", "4820", "notebook"],
    ["Pencil Pack", "Writing", "10 pcs", "9609", "pencil"],
    ["Eraser Pack", "Writing", "5 pcs", "4016", "eraser"],
    ["Glue Stick", "Craft", "15 g", "3506", "glue"],
    ["Highlighter Set", "Writing", "5 pcs", "9608", "highlighter"],
    ["Stapler Small", "Office Supplies", "1 pc", "8472", "stapler"],
    ["File Folder", "Office Supplies", "5 pcs", "4820", "folder"]
  ],
  "pet-care": [
    ["Dog Food Chicken", "Dog Food", "1 kg", "2309", "dog food"],
    ["Cat Food Tuna", "Cat Food", "1 kg", "2309", "cat food"],
    ["Dog Treats", "Pet Treats", "200 g", "2309", "dog treat"],
    ["Cat Litter", "Pet Hygiene", "5 kg", "3824", "cat litter"],
    ["Pet Shampoo", "Pet Grooming", "200 ml", "3307", "pet shampoo"],
    ["Pet Bowl", "Pet Accessories", "1 pc", "3924", "pet bowl"],
    ["Bird Feed", "Bird Food", "500 g", "2309", "bird feed"],
    ["Fish Food", "Fish Food", "100 g", "2309", "fish food"]
  ],
  electronics: [
    ["USB-C Cable", "Cables", "1 m", "8544", "usb cable"],
    ["Mobile Charger 20W", "Chargers", "1 pc", "8504", "charger"],
    ["Earphones Wired", "Audio", "1 pc", "8518", "earphones"],
    ["Power Bank 10000mAh", "Power", "1 pc", "8507", "power bank"],
    ["Screen Guard", "Mobile Accessories", "1 pc", "7007", "screen guard"],
    ["Phone Cover", "Mobile Accessories", "1 pc", "3926", "phone cover"],
    ["AA Batteries", "Batteries", "4 pcs", "8506", "battery"],
    ["Extension Board", "Electricals", "1 pc", "8536", "extension board"]
  ],
  fashion: [
    ["Men Cotton T-Shirt", "Men Basics", "1 pc", "6109", "t shirt"],
    ["Women Cotton T-Shirt", "Women Basics", "1 pc", "6109", "t shirt"],
    ["Kids T-Shirt", "Kids Basics", "1 pc", "6109", "kids tshirt"],
    ["Men Socks", "Socks", "3 pairs", "6115", "socks"],
    ["Women Socks", "Socks", "3 pairs", "6115", "socks"],
    ["Handkerchief Pack", "Accessories", "6 pcs", "6213", "handkerchief"],
    ["Cotton Vest", "Innerwear", "1 pc", "6109", "vest"],
    ["Leggings", "Women Basics", "1 pc", "6104", "leggings"]
  ],
  footwear: [
    ["Men Flip Flops", "Slippers", "1 pair", "6402", "flip flop"],
    ["Women Flip Flops", "Slippers", "1 pair", "6402", "slipper"],
    ["Kids Sandals", "Sandals", "1 pair", "6402", "kids sandals"],
    ["Sports Shoes", "Shoes", "1 pair", "6404", "shoes"],
    ["Formal Socks", "Socks", "2 pairs", "6115", "socks"],
    ["Shoe Polish", "Shoe Care", "40 g", "3405", "shoe polish"],
    ["Shoe Brush", "Shoe Care", "1 pc", "9603", "shoe brush"],
    ["Insoles Pair", "Shoe Care", "1 pair", "6406", "insoles"]
  ],
  pooja: [
    ["Agarbatti Sandal", "Incense", "100 sticks", "3307", "agarbatti"],
    ["Camphor Tablets", "Camphor", "100 g", "2914", "kapoor"],
    ["Cotton Wicks", "Pooja Essentials", "100 pcs", "5601", "batti"],
    ["Pooja Oil", "Pooja Essentials", "500 ml", "1518", "pooja oil"],
    ["Kumkum", "Pooja Powder", "50 g", "3304", "kumkum"],
    ["Haldi Kumkum Pack", "Pooja Powder", "100 g", "", "haldi kumkum"],
    ["Diya Clay", "Diyas", "12 pcs", "6912", "diya"],
    ["Panchmeva Pack", "Offerings", "100 g", "0813", "panchmeva"]
  ],
  wellness: [
    ["Hand Sanitizer", "Sanitizer", "500 ml", "3808", "sanitizer"],
    ["Pain Relief Balm", "Pain Relief", "25 g", "3004", "balm"],
    ["Digital Thermometer", "Devices", "1 pc", "9025", "thermometer"],
    ["Bandage Roll", "First Aid", "1 roll", "3005", "bandage"],
    ["ORS Sachets", "Hydration", "10 sachets", "3004", "ors"],
    ["Vitamin C Tablets", "Supplements", "60 tabs", "3004", "vitamin"],
    ["Glucose Powder", "Energy", "500 g", "1702", "glucose"],
    ["Cotton Roll", "First Aid", "100 g", "3005", "cotton"]
  ]
};

function slugify(value) {
  return String(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const generatedCatalogueProducts = Object.entries(catalogueSeed).flatMap(([categoryId, items]) => {
  const category = masterCategories.find((entry) => entry.id === categoryId);
  return items.map(([name, subcategory, unit, hsn, aliases], index) => ({
    id: `${categoryId}-${slugify(name)}-${index + 1}`,
    name,
    category: categoryId,
    subcategory,
    unit,
    hsn,
    gst: hsn ? "As applicable" : "",
    aliases: aliases ? aliases.split("|") : [],
    sellerId: index % 3 === 0 ? "ram" : index % 3 === 1 ? "om" : "sharma",
    icon: category?.emoji || "🛒",
    color: category?.color || "#F2F0EC",
    price: 35 + ((index + categoryId.length) * 13) % 260,
    oldPrice: index % 3 === 0 ? 49 + ((index + categoryId.length) * 17) % 290 : undefined,
    badge: index % 5 === 0 ? "POPULAR" : "",
    image: `local:${categoryId}`,
    tags: [categoryId, subcategory, hsn, ...(aliases ? aliases.split("|") : [])].filter(Boolean)
  }));
});

const masterProducts = [
  ...products.map((product) => ({
    ...product,
    subcategory: product.category === "dairy" ? "Dairy" : product.category === "bakery" ? "Bakery" : "Fresh",
    hsn: product.tags?.find((tag) => tag.startsWith("hsn "))?.replace("hsn ", "") || "",
    aliases: product.tags || [],
    image: `local:${product.category}`
  })),
  ...generatedCatalogueProducts.filter((product) => !products.some((existing) => existing.name === product.name))
];

const defaultSellerLiveProductNames = ["Homemade Mango Pickle", "Mixed Veg Pickle", "Fresh Spinach", "Full Cream Milk", "Multigrain Bread"];
const defaultSellerLiveProducts = Object.fromEntries(
  defaultSellerLiveProductNames
    .map((name, index) => {
      const product = masterProducts.find((entry) => entry.name === name);
      if (!product) return null;
      return [
        product.id,
        {
          productId: product.id,
          price: product.price || 99,
          qty: index === 0 ? 4 : 12 + index * 3,
          active: true,
          tags: index === 0 ? ["Quick Delivery", "Low Stock"] : ["Quick Delivery"],
          sla: "45 min"
        }
      ];
    })
    .filter(Boolean)
);

const languages = [
  { id: "hi", label: "Hindi", native: "हिंदी" },
  { id: "en", label: "English", native: "English" },
  { id: "mr", label: "Marathi", native: "मराठी" },
  { id: "ta", label: "Tamil", native: "தமிழ்" }
];

const tiers = [
  {
    id: "Micro Seller",
    icon: "ti ti-basket",
    title: "Micro Seller",
    summary: "Home seller, small store, daily essentials",
    features: ["Free onboarding", "Basic inventory", "COD + UPI support"]
  },
  {
    id: "Local Store",
    icon: "ti ti-building-store",
    title: "Local Store",
    summary: "Kirana, bakery, dairy, fresh produce shop",
    features: ["Multi-location", "Auto invoicing", "Seller analytics"]
  },
  {
    id: "Wholesaler",
    icon: "ti ti-building-warehouse",
    title: "Wholesaler",
    summary: "Bulk seller with larger fulfilment volume",
    features: ["Bulk orders", "Priority support", "Advanced reports"]
  }
];

const opsRoles = {
  admin: {
    label: "Super Admin",
    avatar: "SA",
    user: "Suresh Admin",
    role: "Backend Admin",
    summary: "Full platform access including payouts and suspensions."
  },
  ops: {
    label: "Ops Manager",
    avatar: "OM",
    user: "Ananya Ops",
    role: "City Operations",
    summary: "Orders, sellers, verification, catalogue, compliance, delivery."
  },
  support: {
    label: "Support Lead",
    avatar: "SL",
    user: "Karan Support",
    role: "Customer Support",
    summary: "Order escalations, seller lookups, and refund handling."
  },
  logistics: {
    label: "Logistics Lead",
    avatar: "LL",
    user: "Ravi Logistics",
    role: "Delivery Control",
    summary: "Delivery batches, order tracking, and handover monitoring."
  }
};

const opsNavItems = [
  { section: "Overview", id: "ops-overview", title: "Platform Overview", icon: "ti ti-layout-dashboard", label: "Dashboard", badge: "", roles: ["admin", "ops", "support", "logistics"] },
  { section: "Overview", id: "ops-orders", title: "Order Monitor", icon: "ti ti-receipt", label: "Order Monitor", badge: "14", roles: ["admin", "ops", "support", "logistics"] },
  { section: "Sellers", id: "ops-sellers", title: "All Sellers", icon: "ti ti-building-store", label: "All Sellers", badge: "", roles: ["admin", "ops", "support"] },
  { section: "Sellers", id: "ops-verification", title: "Seller Verification", icon: "ti ti-shield-check", label: "Verification", badge: "7", roles: ["admin", "ops"] },
  { section: "Sellers", id: "ops-catalogue", title: "Catalogue Import", icon: "ti ti-package", label: "Catalogue Import", badge: "", roles: ["admin", "ops"] },
  { section: "Sellers", id: "ops-leads", title: "Seller Leads", icon: "ti ti-user-plus", label: "Seller Leads", badge: "", roles: ["admin", "ops", "support"] },
  { section: "Finance", id: "ops-refunds", title: "Refund Queue", icon: "ti ti-rotate-clockwise-2", label: "Refunds", badge: "5", roles: ["admin", "support"] },
  { section: "Finance", id: "ops-payouts", title: "Payout Ledger", icon: "ti ti-cash", label: "Payouts", badge: "", roles: ["admin"] },
  { section: "Finance", id: "ops-settings", title: "Payment & Rewards", icon: "ti ti-adjustments", label: "Payment & Rewards", badge: "", roles: ["admin"] },
  { section: "Platform", id: "ops-notifications", title: "Notification Publisher", icon: "ti ti-bell-ringing", label: "Notifications", badge: "", roles: ["admin", "ops"] },
  { section: "Platform", id: "ops-compliance", title: "Compliance Monitor", icon: "ti ti-certificate", label: "Compliance", badge: "", roles: ["admin", "ops"] },
  { section: "Platform", id: "ops-delivery", title: "Delivery Batching", icon: "ti ti-truck-delivery", label: "Delivery Batching", badge: "", roles: ["admin", "ops", "logistics"] }
];

const sellerProducts = [
  {
    id: "mango",
    name: "Homemade Mango Pickle",
    category: "Packaged Food",
    unit: "250 g jar",
    price: 149,
    stock: 4,
    icon: "🥭",
    color: "#FAEEDA",
    status: "Low stock"
  },
  {
    id: "mixed",
    name: "Mixed Veg Pickle",
    category: "Packaged Food",
    unit: "250 g jar",
    price: 139,
    stock: 18,
    icon: "🫙",
    color: "#EAF3DE",
    status: "Active"
  },
  {
    id: "papad",
    name: "Handmade Papad",
    category: "Snacks",
    unit: "200 g pack",
    price: 89,
    stock: 24,
    icon: "🥟",
    color: "#FBEAF0",
    status: "Active"
  }
];

const initialSellerOrders = {
  "ORD-1041": {
    status: "New",
    customer: "Aarav Mehta",
    address: "Andheri West · 1.2 km",
    item: "Homemade Mango Pickle",
    qty: 2,
    value: 298,
    paid: "Prepaid",
    sla: "Accept in 8 min",
    timeline: ["Placed 9:12 AM"]
  },
  "ORD-1039": {
    status: "Confirmed",
    customer: "Priya Shah",
    address: "Lokhandwala · 2.1 km",
    item: "Mixed Veg Pickle",
    qty: 1,
    value: 139,
    paid: "COD",
    sla: "Pack by 10:20 AM",
    timeline: ["Placed 8:40 AM", "Confirmed 8:45 AM"]
  },
  "ORD-1034": {
    status: "Packed",
    customer: "Rohit Yadav",
    address: "Marol · 3.0 km",
    item: "Handmade Papad",
    qty: 3,
    value: 267,
    paid: "UPI",
    sla: "Ready to handover",
    timeline: ["Placed 7:50 AM", "Confirmed 7:54 AM", "Packed 8:16 AM"]
  }
};

const initialState = {
  mode: "customer",
  customerScreen: "splash",
  sellerScreen: "s-lang",
  selectedCategory: "all",
  search: "",
  cart: {},
  orderPlaced: false,
  sellerLanguage: "hi",
  sellerTier: "Micro Seller",
  signupStep: 1,
  opsRole: "admin",
  opsView: "ops-overview",
  sellerOrders: initialSellerOrders,
  sellerStock: { mango: 4, mixed: 18, papad: 24 },
  sellerCatalogueTab: "products",
  sellerSelectedCategories: ["fruits", "vegetables", "dairy", "packaged-food", "snacks"],
  sellerLiveProducts: defaultSellerLiveProducts,
  productApprovalRequests: [
    {
      id: "REQ-0482",
      name: "Homemade Lemon Pickle",
      category: "packaged-food",
      unit: "250 g jar",
      hsn: "2106",
      seller: "Nirmala's Kitchen",
      status: "Pending",
      source: "Seller photo upload",
      image: "🫙",
      rejectionReason: "",
      createdAt: "Today"
    },
    {
      id: "REQ-0481",
      name: "Organic Turmeric Powder",
      category: "spices",
      unit: "100 g",
      hsn: "",
      seller: "Suresh Masale",
      status: "Pending",
      source: "Seller photo upload",
      image: "🌶️",
      rejectionReason: "",
      createdAt: "Yesterday"
    }
  ],
  approvedProducts: [],
  customerAddresses: [
    {
      id: "addr-home",
      type: "Home",
      label: "Andheri (E)",
      line: "Home - 17, Namam Premier, near Raj Industrial complex, Marol",
      lat: "19.1197",
      lng: "72.8468"
    },
    {
      id: "addr-office",
      type: "Office",
      label: "BKC Office",
      line: "Maker Maxity, Bandra Kurla Complex",
      lat: "19.0596",
      lng: "72.8656"
    }
  ],
  paymentConfig: {
    methods: {
      upi: { label: "UPI", enabled: true, vendor: "Razorpay" },
      card: { label: "Cards", enabled: true, vendor: "Cashfree" },
      wallet: { label: "Wallet", enabled: true, vendor: "BazaarPay" },
      cod: { label: "Cash on Delivery", enabled: true, vendor: "COD" }
    }
  },
  rewardConfig: { enabled: true, earnRs: 100, points: 10, label: "10 points per Rs. 100" },
  customerRewardPoints: 320,
  rewardHistory: [
    { id: "rw-signup", text: "Signup bonus", points: 100, date: "Welcome" },
    { id: "rw-order", text: "Order #BS217158110", points: 40, date: "15 Mar" }
  ],
  sellerLeads: [],
  notifications: [
    {
      id: "NTF-CUST-001",
      audience: "customer",
      type: "offer",
      title: "Welcome to Bazaar Setu",
      body: "Fresh local sellers are live near you. Add products to cart and checkout from multiple sellers.",
      createdAt: "Today",
      read: false,
      source: "Admin"
    },
    {
      id: "NTF-CUST-002",
      audience: "customer",
      type: "order",
      title: "Track seller-wise SLA",
      body: "Every order now shows seller fulfilment timeline and delivery promise.",
      createdAt: "Today",
      read: false,
      source: "Admin"
    }
  ],
  sellerProfile: {
    name: "Nirmala Devi",
    phone: "+91 98765 44321",
    email: "nirmala@example.com",
    shop: "Nirmala's Kitchen",
    address: "Kurla West, Mumbai",
    gst: "27ABCDE1234F1Z5",
    fssai: "11223344556677",
    pan: "ABCDE1234F",
    bank: "HDFC ****4821",
    upi: "nirmala@upi",
    deliveryFee: 29,
    autoInvoice: true,
    storeLive: true,
    storeStart: "09:00",
    storeEnd: "21:00",
    slaValue: 45,
    slaUnit: "min",
    documents: ["FSSAI License", "PAN", "Bank proof", "GST Certificate"]
  },
  printRequest: null,
  aiMessages: [
    {
      role: "ai",
      text: "Namaste! Ask me about orders, stock, pricing, invoices, or today's sales."
    }
  ]
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return structuredCloneSafe(initialState);
    return {
      ...structuredCloneSafe(initialState),
      ...saved,
      cart: saved.cart || {},
      sellerOrders: { ...structuredCloneSafe(initialSellerOrders), ...(saved.sellerOrders || {}) },
      sellerStock: { ...initialState.sellerStock, ...(saved.sellerStock || {}) },
      sellerCatalogueTab: saved.sellerCatalogueTab || initialState.sellerCatalogueTab,
      sellerSelectedCategories: saved.sellerSelectedCategories || initialState.sellerSelectedCategories,
      sellerLiveProducts: { ...structuredCloneSafe(defaultSellerLiveProducts), ...(saved.sellerLiveProducts || {}) },
      productApprovalRequests: saved.productApprovalRequests || structuredCloneSafe(initialState.productApprovalRequests),
      approvedProducts: saved.approvedProducts || [],
      customerAddresses: saved.customerAddresses || structuredCloneSafe(initialState.customerAddresses),
      paymentConfig: {
        methods: {
          ...structuredCloneSafe(initialState.paymentConfig.methods),
          ...((saved.paymentConfig && saved.paymentConfig.methods) || {})
        }
      },
      rewardConfig: { ...structuredCloneSafe(initialState.rewardConfig), ...(saved.rewardConfig || {}) },
      customerRewardPoints: Number.isFinite(saved.customerRewardPoints) ? saved.customerRewardPoints : initialState.customerRewardPoints,
      rewardHistory: saved.rewardHistory || structuredCloneSafe(initialState.rewardHistory),
      sellerLeads: saved.sellerLeads || [],
      notifications: saved.notifications || structuredCloneSafe(initialState.notifications),
      sellerProfile: { ...structuredCloneSafe(initialState.sellerProfile), ...(saved.sellerProfile || {}) },
      printRequest: saved.printRequest || null,
      aiMessages: saved.aiMessages && saved.aiMessages.length ? saved.aiMessages : initialState.aiMessages
    };
  } catch (error) {
    return structuredCloneSafe(initialState);
  }
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function money(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sellerById(sellerId) {
  return sellers.find((seller) => seller.id === sellerId) || sellers[0];
}

function getAllMasterProducts() {
  return [...masterProducts, ...(state?.approvedProducts || [])];
}

function categoryById(categoryId) {
  return categories.find((category) => category.id === categoryId) || categories[0];
}

function productById(productId) {
  return getAllMasterProducts().find((product) => product.id === productId);
}

function sellerProductById(productId) {
  return productById(productId) || sellerProducts.find((product) => product.id === productId);
}

function selectedCatalogueProducts() {
  return getAllMasterProducts().filter((product) => state.sellerSelectedCategories.includes(product.category));
}

function liveProductEntries() {
  return Object.values(state.sellerLiveProducts || {})
    .map((entry) => ({ ...entry, product: productById(entry.productId) }))
    .filter((entry) => entry.product);
}

function enabledPaymentMethods() {
  return Object.entries(state.paymentConfig.methods || {}).filter(([, method]) => method.enabled);
}

function customerNotifications() {
  return (state.notifications || []).filter((notification) => ["customer", "all"].includes(notification.audience));
}

function customerUnreadCount() {
  return customerNotifications().filter((notification) => !notification.read).length;
}

function minutesOfDay(value) {
  const [hours, minutes] = String(value || "00:00").split(":").map((part) => Number(part));
  return Math.max(0, Math.min(1439, (hours || 0) * 60 + (minutes || 0)));
}

function isStoreOpenNow(profile = state.sellerProfile) {
  if (!profile.storeLive) return false;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const start = minutesOfDay(profile.storeStart);
  const end = minutesOfDay(profile.storeEnd);
  if (start === end) return true;
  if (start < end) return current >= start && current <= end;
  return current >= start || current <= end;
}

function deliverySlaLabel(profile = state.sellerProfile) {
  const value = Math.max(1, Number(profile.slaValue || 45));
  const unitLabels = { min: "min", hrs: value === 1 ? "hr" : "hrs", day: value === 1 ? "day" : "days" };
  return `${value} ${unitLabels[profile.slaUnit] || "min"}`;
}

function storeStatusLabel(profile = state.sellerProfile) {
  if (!profile.storeLive) return `Store disabled · Enable to go live`;
  if (!isStoreOpenNow(profile)) return `Store closed · Opens ${profile.storeStart}`;
  return `Store live · ${profile.storeStart}-${profile.storeEnd}`;
}

function orderSlaFromSettings(order, profile = state.sellerProfile) {
  if (!profile.storeLive) return "Store disabled";
  if (!isStoreOpenNow(profile)) return `Store closed · opens ${profile.storeStart}`;
  return `Fulfil in ${deliverySlaLabel(profile)}`;
}

function cartLines() {
  return Object.entries(state.cart)
    .map(([productId, qty]) => ({ product: productById(productId), qty }))
    .filter((line) => line.product && line.qty > 0);
}

function cartCount() {
  return cartLines().reduce((total, line) => total + line.qty, 0);
}

function cartSubtotal() {
  return cartLines().reduce((total, line) => total + line.product.price * line.qty, 0);
}

function cartTotals() {
  const subtotal = cartSubtotal();
  const delivery = subtotal > 399 || subtotal === 0 ? 0 : 29;
  const platform = subtotal > 0 ? 5 : 0;
  return { subtotal, delivery, platform, total: subtotal + delivery + platform };
}

function setMode(mode) {
  state.mode = ["customer", "seller", "ops"].includes(mode) ? mode : "customer";
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });
  document.getElementById("customerApp")?.classList.toggle("active-mode", state.mode === "customer");
  document.getElementById("sellerApp")?.classList.toggle("active-mode", state.mode === "seller");
  document.getElementById("opsApp")?.classList.toggle("active-mode", state.mode === "ops");
  if (state.mode === "ops") {
    renderOpsNav();
    showOpsView(state.opsView || "ops-overview");
  }
  saveState();
}

function showCustomerScreen(screenId) {
  const cleanId = screenId.replace(/^customer-/, "");
  state.customerScreen = cleanId;
  document.querySelectorAll(".customer-screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === `customer-${cleanId}`);
  });
  renderCustomerNav();
  if (cleanId === "cart") renderCart();
  if (cleanId === "orders") renderCustomerOrders();
  if (cleanId === "notifications") renderCustomerNotifications();
  if (cleanId === "search") renderProducts();
  if (cleanId === "profile") renderCustomerProfileDetails();
  saveState();
}

function showSellerScreen(screenId) {
  const cleanId = screenId.replace(/^seller-/, "");
  state.sellerScreen = cleanId;
  document.querySelectorAll(".seller-screen").forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === cleanId || screen.id === `seller-${cleanId}`);
  });
  renderSellerNav();
  if (cleanId === "s-signup") renderSignupStep();
  if (cleanId === "s-orders") renderSellerOrders();
  if (cleanId === "s-inventory") renderSellerInventory();
  if (cleanId === "s-profile") renderSellerProfile();
  if (cleanId === "s-ai") renderAiChat();
  if (cleanId === "s-analytics") renderBars();
  renderSellerStoreStatus();
  saveState();
}

function addToCart(productId) {
  state.cart[productId] = (state.cart[productId] || 0) + 1;
  renderCartCount();
  renderProducts();
  renderCart();
  saveState();
}

function updateCartQty(productId, delta) {
  const nextQty = (state.cart[productId] || 0) + delta;
  if (nextQty <= 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = nextQty;
  }
  renderCartCount();
  renderProducts();
  renderCart();
  saveState();
}

function checkoutCart() {
  if (!cartCount()) return;
  const totals = cartTotals();
  if (state.rewardConfig.enabled) {
    const earned = Math.floor(totals.total / Math.max(1, state.rewardConfig.earnRs)) * state.rewardConfig.points;
    if (earned > 0) {
      state.customerRewardPoints += earned;
      state.rewardHistory = [
        { id: `rw-${Date.now()}`, text: "Bazaar Setu checkout reward", points: earned, date: "Just now" },
        ...(state.rewardHistory || [])
      ].slice(0, 8);
    }
  }
  state.orderPlaced = true;
  state.cart = {};
  renderCartCount();
  renderProducts();
  renderCart();
  renderCustomerOrders();
  renderCustomerProfileDetails();
  showCustomerScreen("orders");
  saveState();
}

function acceptSellerOrder(orderId) {
  const order = state.sellerOrders[orderId];
  if (!order) return;
  if (state.sellerProfile.autoInvoice) {
    order.status = "Packed";
    order.invoiceNumber = order.invoiceNumber || generateInvoiceNumber(orderId);
    order.invoiceMode = "Auto";
    order.invoiceGeneratedAt = "Just now";
    order.sla = orderSlaFromSettings(order);
    order.timeline = [...(order.timeline || []), "Confirmed just now", `Auto invoice ${order.invoiceNumber}`, "Moved to Bag Packed"];
  } else {
    order.status = "Invoice Required";
    order.sla = `Add invoice number · SLA ${deliverySlaLabel()}`;
    order.timeline = [...(order.timeline || []), "Confirmed just now", "Invoice required"];
  }
  renderSellerOrders();
  saveState();
}

function markSellerOrderPacked(orderId) {
  const order = state.sellerOrders[orderId];
  if (!order) return;
  if (!order.invoiceNumber) {
    order.status = "Invoice Required";
    order.sla = "Add invoice number first";
    renderSellerOrders();
    saveState();
    return;
  }
  order.status = "Packed";
  order.sla = orderSlaFromSettings(order);
  order.timeline = [...(order.timeline || []), "Bag packed just now"];
  renderSellerOrders();
  saveState();
}

function rejectSellerOrder(orderId) {
  const order = state.sellerOrders[orderId];
  if (!order) return;
  const reason = prompt("Add rejection reason for Ops analysis", "Out of stock") || "No reason added";
  order.status = "Rejected";
  order.sla = order.paid === "Prepaid" ? "Refund pending" : "Closed";
  order.rejectReason = reason;
  order.refundState = order.paid === "Prepaid" ? "Refund Pending" : "Not applicable";
  order.refundAmount = order.paid === "Prepaid" ? order.value : 0;
  order.timeline = [...(order.timeline || []), `Rejected: ${reason}`];
  renderSellerOrders();
  saveState();
}

function updateSellerStock(productId, delta) {
  if (state.sellerLiveProducts[productId]) {
    const product = state.sellerLiveProducts[productId];
    product.qty = Math.max(0, Number(product.qty || 0) + delta);
    renderSellerInventory();
    renderInlineStock();
    saveState();
    return;
  }
  const nextQty = Math.max(0, (state.sellerStock[productId] || 0) + delta);
  state.sellerStock[productId] = nextQty;
  renderSellerInventory();
  renderInlineStock();
  saveState();
}

function generateInvoiceNumber(orderId) {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `BS-${orderId.replace(/\D/g, "").slice(-4)}-${suffix}`;
}

function addManualInvoice(orderId) {
  const order = state.sellerOrders[orderId];
  if (!order) return;
  const invoice = prompt("Enter invoice number", generateInvoiceNumber(orderId));
  if (!invoice) return;
  order.invoiceNumber = invoice;
  order.invoiceMode = "Manual";
  order.invoiceGeneratedAt = "Just now";
  order.status = "Packed";
  order.sla = orderSlaFromSettings(order);
  order.timeline = [...(order.timeline || []), `Manual invoice ${invoice}`, "Moved to Bag Packed"];
  renderSellerOrders();
  saveState();
}

function sendSellerAiMessage(text) {
  const input = document.getElementById("chatInput");
  const messageText = (text || input?.value || "").trim();
  if (!messageText) return;
  state.aiMessages.push({ role: "user", text: messageText });
  state.aiMessages.push({ role: "ai", text: cannedAiReply(messageText) });
  if (input) input.value = "";
  renderAiChat();
  saveState();
}

function cannedAiReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes("stock") || lower.includes("inventory")) {
    return "Mango Pickle has only 4 units. Add at least 10 units today to avoid stock-out cancellations.";
  }
  if (lower.includes("order") || lower.includes("sla")) {
    return "You have 1 new order waiting. Accept it within 8 minutes to keep your seller SLA healthy.";
  }
  if (lower.includes("price") || lower.includes("revenue")) {
    return "Your best margin item is Mixed Veg Pickle. Keep it at Rs. 139 and bundle with papad for higher cart value.";
  }
  if (lower.includes("invoice")) {
    return "Auto invoice is recommended. Once enabled, invoice numbers are generated when orders are confirmed.";
  }
  return "I checked your store. Focus on confirming new orders, updating low stock, and keeping bestsellers visible today.";
}

function renderCustomerNav() {
  const navItems = [
    { id: "home", label: "Home", icon: "ti ti-home" },
    { id: "search", label: "Explore", icon: "ti ti-search" },
    { id: "cart", label: "Cart", icon: "ti ti-shopping-bag" },
    { id: "orders", label: "Orders", icon: "ti ti-receipt" },
    { id: "profile", label: "Profile", icon: "ti ti-user" }
  ];
  const markup = navItems
    .map(
      (item) => `
        <button type="button" class="nav-item ${state.customerScreen === item.id ? "active" : ""}" onclick="showCustomerScreen('${item.id}')">
          <i class="${item.icon}"></i>
          <span>${item.label}</span>
          <b class="nav-dot"></b>
        </button>
      `
    )
    .join("");
  document.querySelectorAll("[data-customer-nav]").forEach((nav) => {
    nav.innerHTML = markup;
  });
}

function renderSellerNav() {
  const navItems = [
    { id: "s-dash", label: "Home", icon: "ti ti-home" },
    { id: "s-orders", label: "Orders", icon: "ti ti-receipt" },
    { id: "s-inventory", label: "Products", icon: "ti ti-package" },
    { id: "s-analytics", label: "Reports", icon: "ti ti-chart-bar" },
    { id: "s-profile", label: "Profile", icon: "ti ti-user-circle" }
  ];
  const markup = navItems
    .map(
      (item) => `
        <button type="button" class="nav-item ${state.sellerScreen === item.id ? "active" : ""}" onclick="showSellerScreen('${item.id}')">
          <i class="${item.icon}"></i>
          <span>${item.label}</span>
          <b class="nav-dot"></b>
        </button>
      `
    )
    .join("");
  document.querySelectorAll("[data-seller-nav]").forEach((nav) => {
    nav.innerHTML = markup;
  });
}

function renderCartCount() {
  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    badge.textContent = cartCount();
  });
}

function renderNotificationCount() {
  const count = customerUnreadCount();
  document.querySelectorAll("[data-notification-count]").forEach((badge) => {
    badge.textContent = count;
    badge.classList.toggle("is-zero", count === 0);
  });
}

function renderHomeCategories() {
  const homeCategories = document.getElementById("homeCategories");
  const searchChips = document.getElementById("searchChips");
  if (homeCategories) {
    homeCategories.innerHTML = categories
      .filter((category) => category.id !== "all")
      .map(
        (category) => `
          <button type="button" class="cat-card" onclick="selectCategory('${category.id}', true)">
            <i class="${category.icon}"></i>
            <span>${category.label}</span>
          </button>
        `
      )
      .join("");
  }
  if (searchChips) {
    searchChips.innerHTML = categories
      .map(
        (category) => `
          <button type="button" class="${state.selectedCategory === category.id ? "active" : ""}" onclick="selectCategory('${category.id}')">
            ${category.label}
          </button>
        `
      )
      .join("");
  }
}

function selectCategory(categoryId, goToSearch = false) {
  state.selectedCategory = categoryId;
  renderHomeCategories();
  renderProducts();
  if (goToSearch) showCustomerScreen("search");
  saveState();
}

function renderSellerStrip() {
  const container = document.getElementById("sellerStrip");
  if (!container) return;
  container.innerHTML = sellers
    .map(
      (seller) => `
        <button type="button" class="seller-card">
          <span class="seller-avatar" style="background:${seller.color}">${seller.initials}</span>
          <strong class="seller-name">${seller.name}</strong>
          <small>${seller.meta}</small>
          <em><i class="ti ti-star-filled"></i>${seller.rating}</em>
          <b>${seller.eta}</b>
        </button>
      `
    )
    .join("");
}

function filterProducts() {
  const query = state.search.trim().toLowerCase();
  return getAllMasterProducts().filter((product) => {
    const seller = sellerById(product.sellerId);
    const category = categoryById(product.category);
    const haystack = [
      product.name,
      product.category,
      category?.label,
      product.subcategory,
      seller.name,
      seller.meta,
      product.unit,
      product.hsn,
      ...(product.aliases || []),
      ...(product.tags || [])
    ]
      .join(" ")
      .toLowerCase();
    const categoryMatch = state.selectedCategory === "all" || product.category === state.selectedCategory;
    const queryMatch = !query || haystack.includes(query);
    return categoryMatch && queryMatch;
  });
}

function renderProducts() {
  const filtered = filterProducts();
  const homeProducts = document.getElementById("homeProducts");
  const searchProducts = document.getElementById("searchProducts");
  const countLabel = document.getElementById("productCountLabel");
  const homeShelf = getAllMasterProducts()
    .filter((product) => ["vegetables", "fruits", "dairy", "bakery", "snacks"].includes(product.category))
    .slice(0, 4);
  const homeMarkup = homeShelf.map(renderProductCard).join("");
  const searchMarkup = filtered.length
    ? filtered.map(renderProductCard).join("")
    : `<div class="empty-state"><i class="ti ti-search-off"></i><strong>No matching products</strong><small>Try another category or search term.</small></div>`;
  if (homeProducts) homeProducts.innerHTML = homeMarkup;
  if (searchProducts) searchProducts.innerHTML = searchMarkup;
  if (countLabel) countLabel.textContent = `${filtered.length} items`;
  const input = document.getElementById("customerSearchInput");
  if (input && input.value !== state.search) input.value = state.search;
  renderHomeCategories();
  renderCartCount();
}

function renderProductCard(product) {
  const qty = state.cart[product.id] || 0;
  return `
    <article class="product-card">
      <div class="prod-media" style="background:${product.color}">
        ${product.badge ? `<b>${product.badge}</b>` : ""}
        <span>${product.icon}</span>
      </div>
      <div class="prod-info">
        <strong class="prod-name">${product.name}</strong>
        <small>${product.unit} · ${sellerById(product.sellerId).eta}</small>
        <div class="prod-price">
          <span>${money(product.price)}</span>
          ${product.oldPrice ? `<del>${money(product.oldPrice)}</del>` : ""}
        </div>
      </div>
      ${
        qty
          ? `<div class="qty-ctrl"><button class="qty-btn" type="button" onclick="updateCartQty('${product.id}', -1)">-</button><span class="qty-val">${qty}</span><button class="qty-btn" type="button" onclick="updateCartQty('${product.id}', 1)">+</button></div>`
          : `<button type="button" class="add-btn" onclick="addToCart('${product.id}')">Add</button>`
      }
    </article>
  `;
}

function renderCart() {
  const label = document.getElementById("cartItemLabel");
  const body = document.getElementById("cartBody");
  if (label) label.textContent = `${cartCount()} items`;
  if (!body) return;
  const lines = cartLines();
  if (!lines.length) {
    body.innerHTML = `
      <div class="cart-empty empty-state">
        <img class="brand-logo empty-logo" src="assets/bazaar-setu-logo.svg" alt="Bazaar Setu logo">
        <strong>Your cart is empty</strong>
        <small>Add fresh products from local sellers near you.</small>
        <button type="button" class="pri-btn" onclick="showCustomerScreen('home')">Start Shopping</button>
      </div>
    `;
    return;
  }

  const grouped = lines.reduce((acc, line) => {
    const seller = sellerById(line.product.sellerId);
    acc[seller.id] ||= { seller, lines: [] };
    acc[seller.id].lines.push(line);
    return acc;
  }, {});
  const sellerSections = Object.values(grouped)
    .map(
      (group) => `
        <section class="cart-seller-section">
          <div class="cart-seller-hdr">
            <strong>${group.seller.name}</strong>
            <small>${group.seller.eta}</small>
          </div>
          ${group.lines
            .map(
              (line) => `
                <article class="cart-item">
                  <span style="background:${line.product.color}">${line.product.icon}</span>
                  <div><strong>${line.product.name}</strong><small>${line.product.unit}</small></div>
                  <div class="qty-ctrl">
                    <button class="qty-btn" type="button" onclick="updateCartQty('${line.product.id}', -1)">-</button>
                    <span class="qty-val">${line.qty}</span>
                    <button class="qty-btn" type="button" onclick="updateCartQty('${line.product.id}', 1)">+</button>
                  </div>
                  <b>${money(line.product.price * line.qty)}</b>
                </article>
              `
            )
            .join("")}
        </section>
      `
    )
    .join("");
  const totals = cartTotals();
  const paymentMarkup = enabledPaymentMethods()
    .map(([id, method]) => `<span><i class="ti ti-credit-card"></i>${method.label}<small>${method.vendor}</small></span>`)
    .join("");
  const earnPoints = state.rewardConfig.enabled
    ? Math.floor(totals.total / Math.max(1, state.rewardConfig.earnRs)) * state.rewardConfig.points
    : 0;
  body.innerHTML = `
    <div class="cart-content">
      <div class="delivery-note"><i class="ti ti-truck-delivery"></i><span>Multi-seller cart supported. One checkout, seller-wise fulfilment.</span></div>
      ${sellerSections}
      <section class="checkout-options-card">
        <h2>Pay with</h2>
        <div class="checkout-payment-row">${paymentMarkup}</div>
      </section>
      <section class="checkout-options-card reward-earn-card">
        <i class="ti ti-star"></i>
        <div><strong>Rewards</strong><small>${state.rewardConfig.enabled ? `Earn ${earnPoints} points on this order` : "Rewards are currently disabled"}</small></div>
      </section>
      <section class="cart-summary">
        <h2>Bill Details</h2>
        <p><span>Subtotal</span><strong>${money(totals.subtotal)}</strong></p>
        <p><span>Delivery fee</span><strong>${totals.delivery ? money(totals.delivery) : "Free"}</strong></p>
        <p><span>Platform fee</span><strong>${money(totals.platform)}</strong></p>
        <p class="grand"><span>Total</span><strong>${money(totals.total)}</strong></p>
        <button type="button" class="pri-btn" data-checkout>Proceed to Checkout</button>
      </section>
      <div class="pb-safe"></div>
    </div>
  `;
  body.querySelector("[data-checkout]")?.addEventListener("click", checkoutCart);
}

function renderCustomerOrders() {
  const container = document.getElementById("customerOrders");
  if (!container) return;
  const activeOrder = state.orderPlaced
    ? `
      <article class="order-card active-order">
        <header><span>Order #BS231747128</span><b>Active</b></header>
        <h2>Delivery arriving in 31 min</h2>
        <p>Ram Fresh Farms and Om Dairy Hub are preparing your items.</p>
        <div class="order-timeline">
          <span class="done">Placed</span>
          <span class="done">Confirmed</span>
          <span>Bag Packed</span>
          <span>Delivered</span>
        </div>
        <button type="button">Track Order</button>
      </article>
    `
    : `
      <div class="empty-state">
        <img class="brand-logo empty-logo" src="assets/bazaar-setu-logo.svg" alt="Bazaar Setu logo">
        <strong>No active order</strong>
        <small>Checkout your cart and the order timeline will appear here.</small>
        <button type="button" class="pri-btn" onclick="showCustomerScreen('home')">Shop Now</button>
      </div>
    `;
  container.innerHTML = `
    ${activeOrder}
    <article class="order-card">
      <header><span>Order #BS217158110</span><b class="delivered">Delivered</b></header>
      <h2>Fresh groceries delivered</h2>
      <p>Milk, bread, spinach · 15 Mar, 4:07 PM</p>
      <button type="button">Reorder</button>
    </article>
    <div class="pb-safe"></div>
  `;
}

function renderCustomerNotifications() {
  const container = document.getElementById("customerNotifications");
  if (!container) return;
  const notifications = customerNotifications();
  if (!notifications.length) {
    container.innerHTML = `
      <div class="empty-state notification-empty">
        <i class="ti ti-bell-off"></i>
        <strong>No notifications yet</strong>
        <small>Admin published offers, order alerts, and updates will appear here.</small>
      </div>
    `;
    return;
  }
  container.innerHTML = `
    <div class="notification-list">
      ${notifications
        .map(
          (notification) => `
            <article class="notification-card ${notification.read ? "" : "unread"}">
              <div class="notification-dot"><i class="${notification.type === "offer" ? "ti ti-discount-2" : notification.type === "order" ? "ti ti-receipt" : "ti ti-bell"}"></i></div>
              <div>
                <header><span>${escapeHtml(notification.type || "system")}</span>${notification.read ? "" : "<b>New</b>"}</header>
                <strong>${escapeHtml(notification.title)}</strong>
                <p>${escapeHtml(notification.body)}</p>
                <small>${escapeHtml(notification.createdAt || "Just now")} · Published by ${escapeHtml(notification.source || "Admin")}</small>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
    <div class="pb-safe"></div>
  `;
}

function markCustomerNotificationsRead() {
  state.notifications = (state.notifications || []).map((notification) =>
    ["customer", "all"].includes(notification.audience) ? { ...notification, read: true } : notification
  );
  renderCustomerNotifications();
  renderNotificationCount();
  saveState();
}

function renderCustomerProfileDetails() {
  const container = document.getElementById("customerProfileDetails");
  if (!container) return;
  const lead = state.sellerLeads.find((entry) => entry.phone === "+91 98765 43210");
  const addresses = state.customerAddresses || [];
  const paymentMethods = enabledPaymentMethods();
  container.innerHTML = `
    <section class="customer-profile-block">
      <header><h2>Saved Addresses</h2><button type="button" onclick="saveCustomerAddress()">Add</button></header>
      <small class="profile-helper">${addresses.length}/5 saved with map latitude and longitude</small>
      <div class="address-list">
        ${addresses
          .map(
            (address) => `
              <article class="address-card">
                <i class="ti ti-map-pin"></i>
                <div>
                  <strong>${escapeHtml(address.type)} · ${escapeHtml(address.label)}</strong>
                  <small>${escapeHtml(address.line)}</small>
                  <em>Lat ${escapeHtml(address.lat)} · Long ${escapeHtml(address.lng)}</em>
                  <div class="address-actions">
                    <button type="button" onclick="editCustomerAddress('${address.id}')"><i class="ti ti-pencil"></i>Edit</button>
                    <button type="button" onclick="removeCustomerAddress('${address.id}')"><i class="ti ti-trash"></i>Remove</button>
                  </div>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
    <section class="customer-profile-block">
      <header><h2>Payments</h2><span>${paymentMethods.length} active</span></header>
      <div class="payment-method-grid">
        ${paymentMethods
          .map(
            ([id, method]) => `
              <article class="payment-method-card">
                <i class="${id === "upi" ? "ti ti-brand-google-pay" : id === "cod" ? "ti ti-cash" : "ti ti-credit-card"}"></i>
                <div><strong>${method.label}</strong><small>${method.vendor}</small></div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
    <section class="customer-profile-block">
      <header><h2>Rewards</h2><strong>${state.customerRewardPoints} pts</strong></header>
      <small class="profile-helper">${state.rewardConfig.enabled ? state.rewardConfig.label : "Rewards disabled by admin"}</small>
      <div class="reward-history">
        ${(state.rewardHistory || [])
          .slice(0, 4)
          .map((item) => `<div><span>${escapeHtml(item.text)}</span><strong>+${item.points}</strong><small>${escapeHtml(item.date)}</small></div>`)
          .join("")}
      </div>
    </section>
    ${
      lead
        ? `<section class="customer-profile-block seller-lead-status"><header><h2>Seller Lead</h2><span>${escapeHtml(lead.status)}</span></header><small>Ops team has received your seller onboarding request.</small></section>`
        : ""
    }
  `;
}

function saveCustomerAddress(payload) {
  const current = state.customerAddresses || [];
  if (current.length >= 5) {
    renderCustomerProfileDetails();
    return false;
  }
  const nextIndex = current.length + 1;
  const fallback = {
    id: `addr-${Date.now()}`,
    type: nextIndex % 2 === 0 ? "Office" : nextIndex % 3 === 0 ? "Other" : "Home",
    label: `Saved Address ${nextIndex}`,
    line: "Mumbai service area, captured from Google Maps pin",
    lat: (19.076 + nextIndex / 1000).toFixed(4),
    lng: (72.8777 + nextIndex / 1000).toFixed(4)
  };
  state.customerAddresses = [...current, { ...fallback, ...(payload || {}) }];
  renderCustomerProfileDetails();
  saveState();
  return true;
}

function editCustomerAddress(addressId, payload) {
  const address = (state.customerAddresses || []).find((item) => item.id === addressId);
  if (!address) return false;
  const updated = payload || {
    label: prompt("Address label", address.label) || address.label,
    line: prompt("Full address", address.line) || address.line,
    lat: prompt("Latitude", address.lat) || address.lat,
    lng: prompt("Longitude", address.lng) || address.lng
  };
  state.customerAddresses = state.customerAddresses.map((item) => (item.id === addressId ? { ...item, ...updated } : item));
  renderCustomerProfileDetails();
  saveState();
  return true;
}

function removeCustomerAddress(addressId) {
  state.customerAddresses = (state.customerAddresses || []).filter((item) => item.id !== addressId);
  renderCustomerProfileDetails();
  saveState();
  return true;
}

function submitSellerLead() {
  const exists = state.sellerLeads.some((lead) => lead.phone === "+91 98765 43210");
  if (!exists) {
    state.sellerLeads = [
      {
        id: `LEAD-${Date.now()}`,
        customer: "Rahul Kumar",
        phone: "+91 98765 43210",
        source: "Customer profile",
        status: "New lead",
        createdAt: "Just now"
      },
      ...(state.sellerLeads || [])
    ];
    state.notifications = [
      { id: `NOTIF-${Date.now()}`, audience: "ops", text: "New seller lead from Rahul Kumar", createdAt: "Just now" },
      ...(state.notifications || [])
    ];
  }
  renderCustomerProfileDetails();
  renderOpsSellerLeads();
  saveState();
}

function renderLanguageGrid() {
  const container = document.getElementById("languageGrid");
  if (!container) return;
  container.innerHTML = languages
    .map(
      (language) => `
        <button type="button" class="tier-card ${state.sellerLanguage === language.id ? "active" : ""}" onclick="selectLanguage('${language.id}')">
          <strong>${language.native}</strong>
          <small>${language.label}</small>
        </button>
      `
    )
    .join("");
}

function selectLanguage(languageId) {
  state.sellerLanguage = languageId;
  renderLanguageGrid();
  saveState();
}

function renderTierList() {
  const container = document.getElementById("tierList");
  const tierButton = document.getElementById("tierButton");
  if (!container) return;
  container.innerHTML = tiers
    .map(
      (tier) => `
        <button type="button" class="tier-card ${state.sellerTier === tier.id ? "active" : ""}" onclick="selectTier('${tier.id}')">
          <header><i class="${tier.icon}"></i><div><strong>${tier.title}</strong><small>${tier.summary}</small></div></header>
          <ul>${tier.features.map((item) => `<li><i class="ti ti-check"></i>${item}</li>`).join("")}</ul>
        </button>
      `
    )
    .join("");
  if (tierButton) tierButton.innerHTML = `Register as ${state.sellerTier} <i class="ti ti-arrow-right"></i>`;
}

function selectTier(tierId) {
  state.sellerTier = tierId;
  renderTierList();
  saveState();
}

function renderSignupStep() {
  const step = Math.max(1, Math.min(4, state.signupStep));
  state.signupStep = step;
  const stepNum = document.getElementById("stepNum");
  const dots = document.getElementById("stepDots");
  const progress = document.getElementById("progressBar");
  const body = document.getElementById("signupSteps");
  if (stepNum) stepNum.textContent = step;
  if (dots) {
    dots.innerHTML = [1, 2, 3, 4].map((item) => `<i class="${item <= step ? "active" : ""}"></i>`).join("");
  }
  if (progress) progress.style.width = `${step * 25}%`;
  if (!body) return;

  const steps = [
    {
      title: "Business details",
      subtitle: "Tell us who is selling on Bazaar Setu.",
      fields: ["Seller name", "Shop name", "Mobile number"]
    },
    {
      title: "Location & timings",
      subtitle: "Customers and delivery partners need exact pickup info.",
      fields: ["Pickup address", "City / PIN", "Store open hours"]
    },
    {
      title: "Compliance",
      subtitle: "Mandatory documents depend on what you sell.",
      fields: ["FSSAI number", "GSTIN / PAN", "Business category"]
    },
    {
      title: "Bank & go live",
      subtitle: "Add payout details and review your seller profile.",
      fields: ["UPI ID", "Bank account", "Auto invoice preference"]
    }
  ];
  const current = steps[step - 1];
  body.innerHTML = `
    <section class="signup-step">
      <h2>${current.title}</h2>
      <p>${current.subtitle}</p>
      ${current.fields.map((field) => `<label><span>${field}</span><input value="" placeholder="${field}"></label>`).join("")}
      <div class="signup-note"><i class="ti ti-shield-check"></i><span>Your information is used only for seller verification and payouts.</span></div>
      <button type="button" class="pri-btn" onclick="advanceSignup()">${step === 4 ? "Finish Setup" : "Continue"} <i class="ti ti-arrow-right"></i></button>
      ${step > 1 ? `<button type="button" class="ghost-wide" onclick="backSignup()">Back</button>` : ""}
    </section>
  `;
}

function advanceSignup() {
  if (state.signupStep >= 4) {
    state.signupStep = 4;
    showSellerScreen("s-dash");
  } else {
    state.signupStep += 1;
    renderSignupStep();
  }
  saveState();
}

function backSignup() {
  state.signupStep = Math.max(1, state.signupStep - 1);
  renderSignupStep();
  saveState();
}

function renderInlineStock() {
  document.querySelectorAll("[data-stock-inline]").forEach((element) => {
    element.textContent = state.sellerStock.mango || 0;
  });
}

function renderAiChips() {
  const container = document.getElementById("aiChips");
  if (!container) return;
  const prompts = ["What should I restock?", "Show pending orders", "How is revenue?", "Invoice help"];
  container.innerHTML = prompts.map((prompt) => `<button type="button" onclick="sendSellerAiMessage('${prompt}')">${prompt}</button>`).join("");
}

function renderAiChat() {
  const container = document.getElementById("aiChat");
  if (!container) return;
  container.innerHTML = `
    <div class="ai-date">Today</div>
    ${state.aiMessages
      .map(
        (message) => `
          <div class="ai-bubble ${message.role === "user" ? "user" : ""}">
            ${escapeHtml(message.text)}
          </div>
        `
      )
      .join("")}
  `;
  container.scrollTop = container.scrollHeight;
}

function renderSellerOrders() {
  const container = document.getElementById("sellerOrders");
  if (!container) return;
  container.innerHTML = `
    <div class="seller-filter-row">
      <button type="button" class="active">New</button>
      <button type="button">Invoice Required</button>
      <button type="button">Bag Packed</button>
      <button type="button">Ready To Handover</button>
      <button type="button">Closed</button>
    </div>
    ${Object.entries(state.sellerOrders)
      .map(([orderId, order]) => renderSellerOrder(orderId, order))
      .join("")}
    <div class="pb-safe"></div>
  `;
}

function renderSellerOrder(orderId, order) {
  const displaySla = order.status === "Rejected" ? order.sla : orderSlaFromSettings(order);
  const actionMarkup = order.status === "New" && !state.sellerProfile.storeLive
    ? `
      <button type="button" onclick="showSellerScreen('s-profile')">Enable Store</button>
      <button type="button" class="secondary" onclick="rejectSellerOrder('${orderId}')">Reject</button>
    `
    : order.status === "New"
    ? `
      <button type="button" onclick="acceptSellerOrder('${orderId}')">Confirm</button>
      <button type="button" class="secondary" onclick="rejectSellerOrder('${orderId}')">Reject</button>
    `
    : order.status === "Invoice Required"
      ? `<button type="button" onclick="addManualInvoice('${orderId}')">Add Invoice</button><button type="button" class="warning" onclick="openPrintOptions('${orderId}', 'label')">Preview Label</button>`
      : order.status === "Accepted" || order.status === "Confirmed"
        ? `<button type="button" onclick="markSellerOrderPacked('${orderId}')">Mark Bag Packed</button><button type="button" class="warning" onclick="openPrintOptions('${orderId}', 'label')">Print Label</button>`
        : order.status === "Packed"
          ? `<button type="button" onclick="openPrintOptions('${orderId}', 'invoice')">Print Invoice</button><button type="button" class="warning" onclick="openPrintOptions('${orderId}', 'label')">Print Label</button>`
          : `<button type="button" class="secondary" onclick="openPrintOptions('${orderId}', 'invoice')">View Details</button>`;
  return `
    <article class="seller-order-card">
      <div class="seller-order-top">
        <div><strong>${orderId}</strong><small>${order.customer} · ${order.address}</small></div>
        <span class="${order.status.toLowerCase().replaceAll(" ", "-")}">${order.status}</span>
      </div>
      <div class="seller-order-item">
        <span class="thumb">🛍️</span>
        <div><strong>${order.item}</strong><small>Qty ${order.qty} · ${order.paid} · ${displaySla}</small></div>
        <b>${money(order.value)}</b>
      </div>
      ${
        order.invoiceNumber
          ? `<div class="invoice-strip"><i class="ti ti-file-invoice"></i><span>Invoice ${escapeHtml(order.invoiceNumber)} · ${escapeHtml(order.invoiceMode || "Manual")}</span></div>`
          : ""
      }
      ${order.rejectReason ? `<div class="invoice-strip reject"><i class="ti ti-alert-circle"></i><span>${escapeHtml(order.rejectReason)} · ${escapeHtml(order.refundState || "")}</span></div>` : ""}
      <div class="order-mini-timeline">
        ${(order.timeline || []).map((event) => `<span>${event}</span>`).join("")}
      </div>
      <div class="seller-order-actions">${actionMarkup}</div>
    </article>
  `;
}

function renderSellerInventory() {
  const container = document.getElementById("sellerInventory");
  if (!container) return;
  const allowedTabs = ["products", "my-products", "inventory", "add-new"];
  const tab = allowedTabs.includes(state.sellerCatalogueTab) ? state.sellerCatalogueTab : "products";
  state.sellerCatalogueTab = tab;
  const tabs = [
    ["products", "Products"],
    ["my-products", "My Products"],
    ["inventory", "Inventory"],
    ["add-new", "Add New Product"]
  ];
  const categoryPicker = masterCategories
    .map(
      (category) => `
        <button type="button" class="${state.sellerSelectedCategories.includes(category.id) ? "active" : ""}" onclick="selectSellerCategory('${category.id}')">
          <span>${category.emoji}</span>${category.label}
        </button>
      `
    )
    .join("");
  container.innerHTML = `
    <div class="seller-catalogue-tabs">
      ${tabs.map(([id, label]) => `<button type="button" class="${tab === id ? "active" : ""}" onclick="showSellerCatalogueTab('${id}')">${label}</button>`).join("")}
    </div>
    <div class="seller-category-picker">${categoryPicker}</div>
    ${renderSellerCatalogueTab(tab)}
    <div class="pb-safe"></div>
  `;
  renderInlineStock();
}

function renderSellerCatalogueTab(tab) {
  if (tab === "my-products") return renderMyProductsTab();
  if (tab === "inventory") return renderInventoryTab();
  if (tab === "add-new") return renderAddNewProductTab();
  return renderProductsCatalogueTab();
}

function renderProductsCatalogueTab() {
  const productsForSeller = selectedCatalogueProducts();
  return `
    <section class="catalogue-summary-card">
      <strong>${productsForSeller.length} catalogue products available</strong>
      <small>Select your onboarding categories above. Products from those categories can be added to inventory with only price and quantity.</small>
    </section>
    <div class="seller-catalogue-list">
      ${productsForSeller.map(renderCatalogueProductCard).join("")}
    </div>
  `;
}

function renderCatalogueProductCard(product) {
  const live = Boolean(state.sellerLiveProducts[product.id]);
  const category = categoryById(product.category);
  return `
    <article class="catalogue-card">
      <div class="catalogue-media" style="background:${product.color}"><span>${product.icon}</span></div>
      <div class="catalogue-info">
        <strong>${escapeHtml(product.name)}</strong>
        <small>${escapeHtml(category.label)} · ${escapeHtml(product.subcategory || "General")} · ${escapeHtml(product.unit)}</small>
        <em>HSN ${product.hsn ? escapeHtml(product.hsn) : "Optional"} · GST ${escapeHtml(product.gst || "As applicable")}</em>
      </div>
      <button type="button" class="${live ? "seller-live-badge" : ""}" onclick="addSellerProduct('${product.id}')">${live ? "Live" : "Add"}</button>
    </article>
  `;
}

function renderMyProductsTab() {
  const liveProducts = liveProductEntries().filter((entry) => entry.active);
  if (!liveProducts.length) {
    return `<div class="empty-state"><i class="ti ti-package-off"></i><strong>No live products</strong><small>Add products from catalogue and set price/quantity.</small></div>`;
  }
  return `<div class="seller-catalogue-list">${liveProducts.map(renderLiveProductCard).join("")}</div>`;
}

function renderInventoryTab() {
  const productsForSeller = selectedCatalogueProducts();
  return `
    <section class="catalogue-summary-card">
      <strong>Inventory controls</strong>
      <small>Update only price, quantity, active status, tags, and SLA. Master product fields stay platform-owned.</small>
    </section>
    <div class="seller-catalogue-list">${productsForSeller.map(renderInventoryProductCard).join("")}</div>
  `;
}

function renderLiveProductCard(entry) {
  const product = entry.product;
  const category = categoryById(product.category);
  return `
    <article class="inventory-card">
      <div class="inventory-main">
        <span class="thumb" style="background:${product.color}">${product.icon}</span>
        <div><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(category.label)} · ${escapeHtml(product.unit)} · HSN ${product.hsn || "Optional"}</small></div>
        <b>${money(entry.price)}</b>
      </div>
      <div class="stock-editor">
        <span>${entry.qty <= 5 ? "Low stock alert" : `${entry.tags?.join(", ") || "Quick Delivery"} · ${entry.sla || "45 min"}`}</span>
        <button type="button" class="qty-btn" onclick="updateSellerStock('${product.id}', -1)">-</button>
        <strong>${entry.qty}</strong>
        <button type="button" class="qty-btn" onclick="updateSellerStock('${product.id}', 1)">+</button>
        <button type="button" onclick="updateSellerProduct('${product.id}', { active: ${entry.active ? "false" : "true"} })">${entry.active ? "Pause" : "Live"}</button>
      </div>
    </article>
  `;
}

function renderInventoryProductCard(product) {
  const entry = state.sellerLiveProducts[product.id];
  if (!entry) return renderCatalogueProductCard(product);
  return renderLiveProductCard({ ...entry, product });
}

function renderAddNewProductTab() {
  return `
    <section class="request-form">
      <h2>Request a new product</h2>
      <p>Upload/capture product photo and add basic details. Ops approval is required before the product goes live.</p>
      <div class="photo-upload"><i class="ti ti-camera-plus"></i><strong>Photo capture placeholder</strong><small>Prototype stores a local mock image only.</small></div>
      <label class="field"><span>Product name</span><input id="newProductName" placeholder="Example: Homemade Lemon Pickle"></label>
      <label class="field"><span>Category</span><select id="newProductCategory">${masterCategories.map((category) => `<option value="${category.id}">${category.label}</option>`).join("")}</select></label>
      <div class="two-fields">
        <label class="field"><span>Unit</span><input id="newProductUnit" placeholder="250 g jar"></label>
        <label class="field"><span>HSN optional</span><input id="newProductHsn" placeholder="2106"></label>
      </div>
      <button type="button" class="ghost-wide" onclick="mockAiExtractProduct()"><i class="ti ti-sparkles"></i> AI Extract Basic Details</button>
      <button type="button" class="pri-btn" onclick="submitProductRequest()">Submit for Ops Approval</button>
    </section>
    <section class="request-form compact">
      <h2>Your requests</h2>
      ${(state.productApprovalRequests || [])
        .filter((request) => request.seller === state.sellerProfile.shop)
        .map((request) => `<div class="request-row"><span>${escapeHtml(request.name)}</span><strong>${escapeHtml(request.status)}</strong><small>${escapeHtml(request.rejectionReason || request.createdAt)}</small></div>`)
        .join("") || `<small>No requests yet.</small>`}
    </section>
  `;
}

function sellerProfileMarkup() {
  const profile = state.sellerProfile;
  return `
    <section class="store-status-card ${profile.storeLive ? "live" : "offline"}">
      <div>
        <span>${profile.storeLive ? "Live on Bazaar Setu" : "Store disabled"}</span>
        <strong>${escapeHtml(storeStatusLabel(profile))}</strong>
        <small>Orders use this timing window and delivery SLA for customer promise.</small>
      </div>
      <button type="button" onclick="toggleSellerStoreLive()">${profile.storeLive ? "Disable" : "Enable"}</button>
    </section>
    <section class="seller-profile-card">
      <header><h2>Profile</h2><button type="button" onclick="saveSellerProfileMock()">Save</button></header>
      <div class="seller-profile-grid">
        <label class="field"><span>Seller name</span><input id="sellerProfileName" value="${escapeHtml(profile.name)}"></label>
        <label class="field"><span>Phone</span><input id="sellerProfilePhone" value="${escapeHtml(profile.phone)}"></label>
        <label class="field"><span>Email</span><input id="sellerProfileEmail" value="${escapeHtml(profile.email)}"></label>
        <label class="field"><span>Shop name</span><input id="sellerProfileShop" value="${escapeHtml(profile.shop)}"></label>
        <label class="field full"><span>Pickup address</span><input id="sellerProfileAddress" value="${escapeHtml(profile.address)}"></label>
        <label class="field"><span>Store start time</span><input id="sellerStoreStart" type="time" value="${escapeHtml(profile.storeStart)}"></label>
        <label class="field"><span>Store end time</span><input id="sellerStoreEnd" type="time" value="${escapeHtml(profile.storeEnd)}"></label>
        <label class="field"><span>Delivery SLA</span><input id="sellerSlaValue" type="number" min="1" value="${escapeHtml(profile.slaValue)}"></label>
        <label class="field"><span>SLA unit</span><select id="sellerSlaUnit">
          <option value="min" ${profile.slaUnit === "min" ? "selected" : ""}>Minutes</option>
          <option value="hrs" ${profile.slaUnit === "hrs" ? "selected" : ""}>Hours</option>
          <option value="day" ${profile.slaUnit === "day" ? "selected" : ""}>Days</option>
        </select></label>
        <label class="field full"><span>Delivery fee</span><input id="sellerDeliveryFee" type="number" min="0" value="${escapeHtml(profile.deliveryFee)}"></label>
      </div>
      <div class="seller-doc-grid">
        <div><span>FSSAI</span><strong>${escapeHtml(profile.fssai)}</strong></div>
        <div><span>GSTIN</span><strong>${escapeHtml(profile.gst)}</strong></div>
        <div><span>PAN</span><strong>${escapeHtml(profile.pan)}</strong></div>
        <div><span>Bank</span><strong>${escapeHtml(profile.bank)}</strong></div>
        <div><span>UPI</span><strong>${escapeHtml(profile.upi)}</strong></div>
        <div><span>Delivery fee</span><strong>${money(profile.deliveryFee)}</strong></div>
      </div>
      <div class="seller-toggle-row">
        <span><strong>Auto invoicing</strong><small>${profile.autoInvoice ? "Invoice number generates on confirm" : "Manual invoice needed after confirm"}</small></span>
        <button type="button" onclick="toggleSellerAutoInvoice()">${profile.autoInvoice ? "Enabled" : "Disabled"}</button>
      </div>
      <div class="doc-chip-row">${profile.documents.map((doc) => `<span>${escapeHtml(doc)}</span>`).join("")}</div>
    </section>
  `;
}

function renderSellerProfile() {
  const container = document.getElementById("sellerProfile");
  if (!container) return;
  container.innerHTML = `${sellerProfileMarkup()}<div class="pb-safe"></div>`;
}

function showSellerCatalogueTab(tabId) {
  state.sellerCatalogueTab = tabId;
  renderSellerInventory();
  saveState();
}

function selectSellerCategory(categoryId) {
  if (!masterCategories.some((category) => category.id === categoryId)) return;
  const selected = new Set(state.sellerSelectedCategories || []);
  if (selected.has(categoryId)) {
    if (selected.size === 1) return;
    selected.delete(categoryId);
  } else {
    selected.add(categoryId);
  }
  state.sellerSelectedCategories = [...selected];
  renderSellerInventory();
  saveState();
}

function addSellerProduct(productId) {
  const product = productById(productId);
  if (!product) return;
  state.sellerLiveProducts[productId] ||= {
    productId,
    price: product.price || 99,
    qty: 10,
    active: true,
    tags: ["Quick Delivery"],
    sla: "45 min"
  };
  renderSellerInventory();
  renderProducts();
  saveState();
}

function updateSellerProduct(productId, fields) {
  const product = productById(productId);
  if (!product) return;
  state.sellerLiveProducts[productId] ||= {
    productId,
    price: product.price || 99,
    qty: 0,
    active: false,
    tags: ["Quick Delivery"],
    sla: "45 min"
  };
  state.sellerLiveProducts[productId] = {
    ...state.sellerLiveProducts[productId],
    ...(fields || {})
  };
  renderSellerInventory();
  renderProducts();
  saveState();
}

function mockAiExtractProduct() {
  const name = document.getElementById("newProductName");
  const category = document.getElementById("newProductCategory");
  const unit = document.getElementById("newProductUnit");
  const hsn = document.getElementById("newProductHsn");
  if (name) name.value = "Homemade Lemon Pickle";
  if (category) category.value = "packaged-food";
  if (unit) unit.value = "250 g jar";
  if (hsn) hsn.value = "2106";
}

function submitProductRequest(payload) {
  const data = payload || {
    name: document.getElementById("newProductName")?.value?.trim(),
    category: document.getElementById("newProductCategory")?.value,
    unit: document.getElementById("newProductUnit")?.value?.trim(),
    hsn: document.getElementById("newProductHsn")?.value?.trim()
  };
  if (!data.name) return null;
  const request = {
    id: `REQ-${Date.now()}`,
    name: data.name,
    category: data.category || "packaged-food",
    unit: data.unit || "1 pc",
    hsn: data.hsn || "",
    seller: state.sellerProfile.shop,
    status: "Pending",
    source: "Seller photo upload",
    image: categoryById(data.category || "packaged-food").emoji,
    rejectionReason: "",
    createdAt: "Just now"
  };
  state.productApprovalRequests = [request, ...(state.productApprovalRequests || [])];
  state.notifications = [
    { id: `NOTIF-${Date.now()}`, audience: "ops", text: `New product request: ${request.name}`, createdAt: "Just now" },
    ...(state.notifications || [])
  ];
  renderSellerInventory();
  renderOpsCatalogueRequests();
  saveState();
  return request.id;
}

function approveProductRequest(requestId) {
  const request = (state.productApprovalRequests || []).find((item) => item.id === requestId);
  if (!request) return;
  request.status = "Approved";
  request.rejectionReason = "";
  const category = categoryById(request.category);
  const product = {
    id: `approved-${slugify(request.name)}-${Date.now()}`,
    name: request.name,
    category: request.category,
    subcategory: "Seller approved",
    unit: request.unit,
    hsn: request.hsn || "",
    gst: request.hsn ? "As applicable" : "",
    aliases: [request.name.toLowerCase()],
    sellerId: "sharma",
    icon: category.emoji,
    color: category.color,
    price: 99,
    badge: "NEW",
    image: "local:approved",
    tags: [request.category, request.hsn, "seller request"].filter(Boolean)
  };
  state.approvedProducts = [product, ...(state.approvedProducts || [])];
  state.notifications = [
    { id: `NOTIF-${Date.now()}`, audience: "seller", text: `${request.name} approved and added to catalogue`, createdAt: "Just now" },
    ...(state.notifications || [])
  ];
  renderOpsCatalogueRequests();
  renderSellerInventory();
  renderProducts();
  saveState();
}

function rejectProductRequest(requestId, reason) {
  const request = (state.productApprovalRequests || []).find((item) => item.id === requestId);
  if (!request) return;
  request.status = "Rejected";
  request.rejectionReason = reason || prompt("Reject reason", "Missing clear product image") || "No reason added";
  state.notifications = [
    { id: `NOTIF-${Date.now()}`, audience: "seller", text: `${request.name} rejected: ${request.rejectionReason}`, createdAt: "Just now" },
    ...(state.notifications || [])
  ];
  renderOpsCatalogueRequests();
  renderSellerInventory();
  saveState();
}

function saveSellerProfileMock() {
  state.sellerProfile = {
    ...state.sellerProfile,
    name: document.getElementById("sellerProfileName")?.value || state.sellerProfile.name,
    phone: document.getElementById("sellerProfilePhone")?.value || state.sellerProfile.phone,
    email: document.getElementById("sellerProfileEmail")?.value || state.sellerProfile.email,
    shop: document.getElementById("sellerProfileShop")?.value || state.sellerProfile.shop,
    address: document.getElementById("sellerProfileAddress")?.value || state.sellerProfile.address,
    storeStart: document.getElementById("sellerStoreStart")?.value || state.sellerProfile.storeStart,
    storeEnd: document.getElementById("sellerStoreEnd")?.value || state.sellerProfile.storeEnd,
    slaValue: Math.max(1, Number(document.getElementById("sellerSlaValue")?.value || state.sellerProfile.slaValue)),
    slaUnit: document.getElementById("sellerSlaUnit")?.value || state.sellerProfile.slaUnit,
    deliveryFee: Math.max(0, Number(document.getElementById("sellerDeliveryFee")?.value || state.sellerProfile.deliveryFee))
  };
  renderSellerProfile();
  renderSellerOrders();
  renderSellerStoreStatus();
  saveState();
}

function toggleSellerAutoInvoice() {
  state.sellerProfile.autoInvoice = !state.sellerProfile.autoInvoice;
  renderSellerProfile();
  saveState();
}

function toggleSellerStoreLive() {
  state.sellerProfile.storeLive = !state.sellerProfile.storeLive;
  renderSellerProfile();
  renderSellerOrders();
  renderSellerStoreStatus();
  saveState();
}

function renderSellerStoreStatus() {
  document.querySelectorAll("[data-seller-store-status]").forEach((element) => {
    element.innerHTML = `<i></i> ${escapeHtml(storeStatusLabel())}`;
    element.classList.toggle("offline", !isStoreOpenNow());
  });
}

function renderBars() {
  const container = document.getElementById("anBars");
  if (!container) return;
  const values = [42, 56, 38, 74, 68, 91, 82];
  container.innerHTML = values.map((height) => `<i style="height:${height}%"></i>`).join("");
}

function opsRoleInfo() {
  return opsRoles[state.opsRole] || opsRoles.admin;
}

function isOpsAllowed(itemOrRoles, role = state.opsRole) {
  const roles = Array.isArray(itemOrRoles) ? itemOrRoles : itemOrRoles.roles;
  return roles.includes(role);
}

function firstAllowedOpsView(role = state.opsRole) {
  return opsNavItems.find((item) => isOpsAllowed(item, role))?.id || "ops-overview";
}

function renderOpsNav() {
  const nav = document.querySelector("[data-ops-nav]");
  if (!nav) return;
  const allowedItems = opsNavItems.filter((item) => isOpsAllowed(item));
  const sections = [...new Set(allowedItems.map((item) => item.section))];
  nav.innerHTML = sections
    .map((section) => {
      const items = allowedItems
        .filter((item) => item.section === section)
        .map(
          (item) => `
            <button type="button" class="ops-nav-item ${state.opsView === item.id ? "active" : ""}" onclick="showOpsView('${item.id}')" data-ops-nav-item="${item.id}">
              <i class="${item.icon}"></i>
              <span>${item.label}</span>
              ${item.badge ? `<b>${item.badge}</b>` : ""}
            </button>
          `
        )
        .join("");
      return `<div class="ops-nav-section">${section}</div>${items}`;
    })
    .join("");
}

function renderOpsRole() {
  const role = opsRoleInfo();
  document.querySelectorAll("[data-ops-role]").forEach((button) => {
    button.classList.toggle("active", button.dataset.opsRole === state.opsRole);
  });
  const roleName = document.getElementById("opsRoleName");
  const roleSummary = document.getElementById("opsRoleSummary");
  const userAvatar = document.getElementById("opsUserAvatar");
  const userName = document.getElementById("opsUserName");
  const userRole = document.getElementById("opsUserRole");
  if (roleName) roleName.textContent = role.label;
  if (roleSummary) roleSummary.textContent = role.summary;
  if (userAvatar) userAvatar.textContent = role.avatar;
  if (userName) userName.textContent = role.user;
  if (userRole) userRole.textContent = role.role;
}

function renderOpsActions() {
  document.querySelectorAll("[data-action-roles]").forEach((element) => {
    const roles = element.dataset.actionRoles.split(",").map((role) => role.trim());
    const allowed = isOpsAllowed(roles);
    element.disabled = !allowed;
    element.classList.toggle("is-locked", !allowed);
    element.title = allowed ? "" : `Locked for ${opsRoleInfo().label}`;
  });
}

function renderOpsBars() {
  const container = document.getElementById("opsOrderBars");
  if (!container) return;
  const values = [48, 56, 72, 62, 86, 94, 78];
  container.innerHTML = values.map((height) => `<i style="height:${height}%"></i>`).join("");
}

function renderOpsCatalogueRequests() {
  const tbody = document.getElementById("opsCatalogueRequests");
  if (!tbody) return;
  const requests = state.productApprovalRequests || [];
  if (!requests.length) {
    tbody.innerHTML = `<tr><td colspan="7">No product requests yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = requests
    .map((request) => {
      const statusClass = request.status === "Approved" ? "green" : request.status === "Rejected" ? "red" : "amber";
      return `
        <tr>
          <td><strong>${escapeHtml(request.name)}</strong><small>${escapeHtml(request.id)} · ${escapeHtml(request.source)}</small></td>
          <td>${escapeHtml(request.seller)}</td>
          <td><em class="ops-pill blue">${escapeHtml(categoryById(request.category).label)}</em></td>
          <td>${escapeHtml(request.unit)}</td>
          <td>${request.hsn ? `<em class="ops-pill green">${escapeHtml(request.hsn)}</em>` : `<em class="ops-pill amber">Optional</em>`}</td>
          <td><em class="ops-pill ${statusClass}">${escapeHtml(request.status)}</em><small>${escapeHtml(request.rejectionReason || request.createdAt)}</small></td>
          <td>
            <button class="ops-success-btn" data-action-roles="admin,ops" onclick="approveProductRequest('${request.id}')" ${request.status === "Approved" ? "disabled" : ""}>Approve</button>
            <button class="ops-danger-btn" data-action-roles="admin,ops" onclick="rejectProductRequest('${request.id}')" ${request.status === "Rejected" ? "disabled" : ""}>Reject</button>
          </td>
        </tr>
      `;
    })
    .join("");
  renderOpsActions();
}

function renderOpsSellerLeads() {
  const tbody = document.getElementById("opsSellerLeads");
  if (!tbody) return;
  const leads = state.sellerLeads || [];
  if (!leads.length) {
    tbody.innerHTML = `<tr><td colspan="6">No seller leads yet. Customer Become-a-Seller requests will appear here.</td></tr>`;
    return;
  }
  tbody.innerHTML = leads
    .map(
      (lead) => `
        <tr>
          <td><strong>${escapeHtml(lead.customer)}</strong><small>${escapeHtml(lead.id)}</small></td>
          <td>${escapeHtml(lead.phone)}</td>
          <td>${escapeHtml(lead.source)}</td>
          <td><em class="ops-pill amber">${escapeHtml(lead.status)}</em></td>
          <td>${escapeHtml(lead.createdAt)}</td>
          <td><button class="ops-primary-btn" data-action-roles="admin,ops,support">Call</button><button class="ops-secondary-btn" data-action-roles="admin,ops,support">Convert</button></td>
        </tr>
      `
    )
    .join("");
  renderOpsActions();
}

function renderOpsSettings() {
  const payment = document.getElementById("opsPaymentConfig");
  const rewards = document.getElementById("opsRewardConfig");
  if (payment) {
    payment.innerHTML = Object.entries(state.paymentConfig.methods || {})
      .map(
        ([id, method]) => `
          <button type="button" class="ops-setting-card ${method.enabled ? "enabled" : ""}" onclick="togglePaymentMethod('${id}')">
            <i class="${method.enabled ? "ti ti-toggle-right" : "ti ti-toggle-left"}"></i>
            <span><strong>${escapeHtml(method.label)}</strong><small>${escapeHtml(method.vendor)}</small></span>
          </button>
        `
      )
      .join("");
  }
  if (rewards) {
    rewards.innerHTML = `
      <article class="ops-setting-card enabled">
        <i class="${state.rewardConfig.enabled ? "ti ti-gift" : "ti ti-gift-off"}"></i>
        <span><strong>${state.rewardConfig.enabled ? "Rewards enabled" : "Rewards disabled"}</strong><small>${escapeHtml(state.rewardConfig.label)}</small></span>
      </article>
      <button type="button" class="ops-setting-card" onclick="toggleRewardsEnabled()">
        <i class="ti ti-refresh"></i>
        <span><strong>Toggle rewards</strong><small>Enable or disable customer earning</small></span>
      </button>
      <button type="button" class="ops-setting-card" onclick="increaseRewardPoints()">
        <i class="ti ti-star"></i>
        <span><strong>Increase earning</strong><small>${state.rewardConfig.points} points per Rs. ${state.rewardConfig.earnRs}</small></span>
      </button>
    `;
  }
}

function renderOpsNotifications() {
  const history = document.getElementById("opsNotificationHistory");
  if (!history) return;
  const published = (state.notifications || []).slice(0, 12);
  history.innerHTML = published.length
    ? published
        .map(
          (notification) => `
            <article class="ops-notification-row">
              <i class="${notification.type === "offer" ? "ti ti-discount-2" : notification.type === "order" ? "ti ti-receipt" : "ti ti-bell"}"></i>
              <div>
                <strong>${escapeHtml(notification.title)}</strong>
                <small>${escapeHtml(notification.audience)} · ${escapeHtml(notification.createdAt || "Just now")}</small>
                <p>${escapeHtml(notification.body)}</p>
              </div>
              <em class="ops-pill ${notification.read ? "green" : "amber"}">${notification.read ? "Read" : "Unread"}</em>
            </article>
          `
        )
        .join("")
    : `<div class="ops-note">No notifications published yet.</div>`;
}

function publishAdminNotification(payload) {
  const notification = payload || {
    audience: document.getElementById("opsNotificationAudience")?.value || "customer",
    type: document.getElementById("opsNotificationType")?.value || "offer",
    title: document.getElementById("opsNotificationTitle")?.value?.trim() || "Bazaar Setu update",
    body: document.getElementById("opsNotificationBody")?.value?.trim() || "New update from Bazaar Setu."
  };
  const record = {
    id: `NTF-${Date.now()}`,
    audience: notification.audience,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    createdAt: "Just now",
    read: false,
    source: "Admin"
  };
  state.notifications = [record, ...(state.notifications || [])];
  renderOpsNotifications();
  renderCustomerNotifications();
  renderNotificationCount();
  saveState();
  return record.id;
}

function togglePaymentMethod(methodId) {
  const method = state.paymentConfig.methods?.[methodId];
  if (!method) return;
  method.enabled = !method.enabled;
  renderOpsSettings();
  renderCustomerProfileDetails();
  renderCart();
  saveState();
}

function updateRewardConfig(config) {
  state.rewardConfig = {
    ...state.rewardConfig,
    ...(config || {})
  };
  state.rewardConfig.label = `${state.rewardConfig.points} points per Rs. ${state.rewardConfig.earnRs}`;
  renderOpsSettings();
  renderCustomerProfileDetails();
  renderCart();
  saveState();
}

function toggleRewardsEnabled() {
  updateRewardConfig({ enabled: !state.rewardConfig.enabled });
}

function increaseRewardPoints() {
  updateRewardConfig({ points: state.rewardConfig.points + 5 });
}

function orderProductForPrint(order) {
  const byName = getAllMasterProducts().find((product) => product.name === order.item);
  return byName || {
    name: order.item,
    category: "packaged-food",
    subcategory: "Seller product",
    unit: "1 unit",
    hsn: "",
    price: order.value / Math.max(1, order.qty),
    icon: "🛍️"
  };
}

function openPrintOptions(orderId, type) {
  state.printRequest = { orderId, type: type || "invoice", format: "A4" };
  renderPrintModal();
  saveState();
}

function closePrintOptions() {
  state.printRequest = null;
  renderPrintModal();
  saveState();
}

function selectPrintFormat(format) {
  if (!state.printRequest) return;
  state.printRequest.format = format;
  renderPrintModal();
  saveState();
}

function renderPrintModal() {
  const modal = document.getElementById("printModal");
  const title = document.getElementById("printModalTitle");
  const formats = document.getElementById("printFormatButtons");
  const preview = document.getElementById("printPreview");
  if (!modal || !formats || !preview) return;
  const request = state.printRequest;
  modal.classList.toggle("open", Boolean(request));
  modal.setAttribute("aria-hidden", request ? "false" : "true");
  if (!request) {
    preview.innerHTML = "";
    formats.innerHTML = "";
    return;
  }
  const order = state.sellerOrders[request.orderId];
  if (!order) return;
  const type = request.type === "label" ? "Label" : "Invoice";
  if (title) title.textContent = `${type} · ${request.orderId}`;
  const options = ["A4", "A5", "4x6", "80mm thermal"];
  formats.innerHTML = options
    .map((format) => `<button type="button" class="${request.format === format ? "active" : ""}" onclick="selectPrintFormat('${format}')">${format}</button>`)
    .join("");
  preview.innerHTML = renderMockDocument(order, request.orderId, request.type, request.format);
}

function renderMockDocument(order, orderId, type, format) {
  const product = orderProductForPrint(order);
  const cssClass = format === "A5" ? "a5" : format === "4x6" ? "label-4x6" : format === "80mm thermal" ? "thermal" : "a4";
  const invoiceNumber = order.invoiceNumber || generateInvoiceNumber(orderId);
  const invoiceRows = `
    <table>
      <thead><tr><th>Item</th><th>HSN</th><th>Qty/UQC</th><th>Price</th><th>Total</th></tr></thead>
      <tbody><tr><td>${escapeHtml(product.name)}<small>${escapeHtml(product.unit)} · MRP/expiry/origin as applicable</small></td><td>${escapeHtml(product.hsn || "Optional")}</td><td>${order.qty}</td><td>${money(order.value / Math.max(1, order.qty))}</td><td>${money(order.value)}</td></tr></tbody>
    </table>
  `;
  const body = type === "label"
    ? `
      <div class="mock-label-grid">
        <div><span>Ship To</span><strong>${escapeHtml(order.customer)}</strong><small>${escapeHtml(order.address)}</small></div>
        <div><span>Shipment</span><strong>${escapeHtml(orderId)}</strong><small>${escapeHtml(order.sla)}</small></div>
        <div><span>Seller</span><strong>${escapeHtml(state.sellerProfile.shop)}</strong><small>${escapeHtml(state.sellerProfile.phone)}</small></div>
        <div class="barcode">|||| ||| || ||||</div>
      </div>
    `
    : invoiceRows;
  return `
    <article class="mock-doc ${cssClass}" data-print-doc>
      <header>
        <img src="assets/bazaar-setu-logo.svg" alt="Bazaar Setu logo">
        <div><strong>Bazaar Setu</strong><small>${type === "label" ? "Delivery Label" : "Tax Invoice"} · ${escapeHtml(format)}</small></div>
      </header>
      <section class="mock-doc-meta">
        <div><span>Order</span><strong>${escapeHtml(orderId)}</strong></div>
        <div><span>Invoice</span><strong>${escapeHtml(invoiceNumber)}</strong></div>
        <div><span>Date</span><strong>05 Jun 2026</strong></div>
      </section>
      <section class="mock-doc-party">
        <div><span>Seller</span><strong>${escapeHtml(state.sellerProfile.shop)}</strong><small>FSSAI ${escapeHtml(state.sellerProfile.fssai)} · GST ${escapeHtml(state.sellerProfile.gst)}</small></div>
        <div><span>Customer</span><strong>${escapeHtml(order.customer)}</strong><small>${escapeHtml(order.address)}</small></div>
      </section>
      ${body}
      <footer>Support: support@bazaarsetu.example · Legal Metrology/GST/FSSAI fields shown where applicable.</footer>
    </article>
  `;
}

function downloadMockDocument() {
  const doc = document.querySelector("[data-print-doc]");
  if (!doc || !state.printRequest) return;
  const blob = new Blob([`<!doctype html><meta charset="utf-8">${doc.outerHTML}`], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${state.printRequest.type}-${state.printRequest.orderId}-${state.printRequest.format}.html`.replaceAll(" ", "-");
  link.click();
  URL.revokeObjectURL(link.href);
}

function updateOpsTitle() {
  const activeItem = opsNavItems.find((item) => item.id === state.opsView) || opsNavItems[0];
  const title = document.getElementById("opsTitle");
  const note = document.getElementById("opsAccessNote");
  if (title) title.textContent = activeItem.title;
  if (note) note.textContent = `${opsRoleInfo().label}: ${opsRoleInfo().summary}`;
}

function selectOpsRole(role) {
  if (!opsRoles[role]) return;
  state.opsRole = role;
  if (!isOpsAllowed(opsNavItems.find((item) => item.id === state.opsView) || opsNavItems[0], role)) {
    state.opsView = firstAllowedOpsView(role);
  }
  renderOpsRole();
  renderOpsNav();
  showOpsView(state.opsView);
  saveState();
}

function showOpsView(viewId) {
  const target = opsNavItems.find((item) => item.id === viewId);
  state.opsView = target && isOpsAllowed(target) ? target.id : firstAllowedOpsView();
  document.querySelectorAll("[data-ops-view]").forEach((view) => {
    view.classList.toggle("active", view.dataset.opsView === state.opsView);
  });
  document.querySelectorAll("[data-ops-nav-item]").forEach((button) => {
    button.classList.toggle("active", button.dataset.opsNavItem === state.opsView);
  });
  updateOpsTitle();
  renderOpsRole();
  renderOpsActions();
  renderOpsBars();
  renderOpsCatalogueRequests();
  renderOpsSellerLeads();
  renderOpsSettings();
  renderOpsNotifications();
  renderPrintModal();
  saveState();
}

function attachEvents() {
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });
  document.getElementById("customerSearchInput")?.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
    saveState();
  });
  document.querySelectorAll("[data-search-term]").forEach((button) => {
    button.addEventListener("click", () => {
      state.search = button.dataset.searchTerm;
      renderProducts();
      saveState();
    });
  });
  document.querySelectorAll("[data-order-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-order-tab]").forEach((tab) => tab.classList.remove("active"));
      button.classList.add("active");
    });
  });
  document.getElementById("chatInput")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendSellerAiMessage();
  });
}

function renderAll() {
  renderCustomerNav();
  renderSellerNav();
  renderCartCount();
  renderNotificationCount();
  renderHomeCategories();
  renderSellerStrip();
  renderProducts();
  renderCart();
  renderCustomerOrders();
  renderCustomerNotifications();
  renderCustomerProfileDetails();
  renderLanguageGrid();
  renderTierList();
  renderSignupStep();
  renderAiChips();
  renderAiChat();
  renderSellerOrders();
  renderSellerInventory();
  renderSellerProfile();
  renderBars();
  renderInlineStock();
  renderSellerStoreStatus();
  renderOpsRole();
  renderOpsNav();
  renderOpsActions();
  renderOpsBars();
  renderOpsCatalogueRequests();
  renderOpsSellerLeads();
  renderOpsSettings();
  renderOpsNotifications();
  renderPrintModal();
}

document.addEventListener("DOMContentLoaded", () => {
  attachEvents();
  renderAll();
  setMode(state.mode);
  showCustomerScreen(state.customerScreen || "splash");
  showSellerScreen(state.sellerScreen || "s-lang");
  showOpsView(state.opsView || "ops-overview");
});

window.setMode = setMode;
window.showCustomerScreen = showCustomerScreen;
window.showSellerScreen = showSellerScreen;
window.addToCart = addToCart;
window.updateCartQty = updateCartQty;
window.acceptSellerOrder = acceptSellerOrder;
window.markSellerOrderPacked = markSellerOrderPacked;
window.updateSellerStock = updateSellerStock;
window.sendSellerAiMessage = sendSellerAiMessage;
window.showOpsView = showOpsView;
window.selectOpsRole = selectOpsRole;
window.selectSellerCategory = selectSellerCategory;
window.showSellerCatalogueTab = showSellerCatalogueTab;
window.addSellerProduct = addSellerProduct;
window.updateSellerProduct = updateSellerProduct;
window.submitProductRequest = submitProductRequest;
window.approveProductRequest = approveProductRequest;
window.rejectProductRequest = rejectProductRequest;
window.openPrintOptions = openPrintOptions;
window.closePrintOptions = closePrintOptions;
window.saveCustomerAddress = saveCustomerAddress;
window.editCustomerAddress = editCustomerAddress;
window.removeCustomerAddress = removeCustomerAddress;
window.markCustomerNotificationsRead = markCustomerNotificationsRead;
window.submitSellerLead = submitSellerLead;
window.updateRewardConfig = updateRewardConfig;
window.togglePaymentMethod = togglePaymentMethod;
window.publishAdminNotification = publishAdminNotification;
window.mockAiExtractProduct = mockAiExtractProduct;
window.addManualInvoice = addManualInvoice;
window.selectPrintFormat = selectPrintFormat;
window.downloadMockDocument = downloadMockDocument;
window.toggleRewardsEnabled = toggleRewardsEnabled;
window.increaseRewardPoints = increaseRewardPoints;
window.saveSellerProfileMock = saveSellerProfileMock;
window.toggleSellerStoreLive = toggleSellerStoreLive;
window.toggleSellerAutoInvoice = toggleSellerAutoInvoice;
window.__catalogueCount = () => getAllMasterProducts().length;
window.__bazaarSetuState = state;
