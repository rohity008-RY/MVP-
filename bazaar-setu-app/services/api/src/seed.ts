import type {
  ApprovalStatus,
  DocumentType,
  OrderStatus,
  PaymentState,
  Prisma,
  SupportMessageVisibility,
  SupportTicketPriority,
  SupportTicketSource,
  SupportTicketStatus
} from "@prisma/client";
import { prisma } from "./db.js";

type DemoCategory = { id: string; name: string; icon: string };
type DemoProduct = {
  id: string;
  categoryId: string;
  subcategory?: string;
  name: string;
  brand?: string;
  unit: string;
  uqc?: string;
  hsn?: string;
  gstRate?: number;
  mrp: number;
  aliases?: string[];
  fssaiApplicable?: boolean;
};

const categories: DemoCategory[] = [
  { id: "fruits", name: "Fruits", icon: "apple" },
  { id: "vegetables", name: "Vegetables", icon: "leaf" },
  { id: "dairy-eggs", name: "Dairy & Eggs", icon: "milk" },
  { id: "meat-seafood", name: "Meat & Seafood", icon: "meat" },
  { id: "bakery", name: "Bakery", icon: "bread" },
  { id: "snacks", name: "Snacks", icon: "snack" },
  { id: "beverages", name: "Beverages", icon: "drink" },
  { id: "staples", name: "Staples", icon: "rice" },
  { id: "pulses", name: "Pulses & Dal", icon: "dal" },
  { id: "spices", name: "Masala & Spices", icon: "spice" },
  { id: "packaged-food", name: "Packaged Food", icon: "jar" },
  { id: "instant-food", name: "Instant Food", icon: "noodle" },
  { id: "personal-care", name: "Personal Care", icon: "care" },
  { id: "home-care", name: "Home Care", icon: "clean" },
  { id: "household", name: "Household", icon: "home" },
  { id: "baby-care", name: "Baby Care", icon: "baby" },
  { id: "pet-care", name: "Pet Care", icon: "pet" },
  { id: "stationery", name: "Stationery", icon: "pen" },
  { id: "electronics-accessories", name: "Electronics Accessories", icon: "cable" },
  { id: "fashion-basics", name: "Fashion Basics", icon: "shirt" },
  { id: "footwear", name: "Footwear", icon: "shoe" },
  { id: "pooja", name: "Pooja Items", icon: "diya" },
  { id: "wellness", name: "Pharmacy & Wellness", icon: "plus" }
];

const products: DemoProduct[] = [
  { id: "tomato-hybrid", categoryId: "vegetables", subcategory: "Fresh Vegetables", name: "Tomato Hybrid", unit: "1 kg", uqc: "KGS", hsn: "0702", gstRate: 0, mrp: 34, aliases: ["tamatar", "tomato"] },
  { id: "potato-agra", categoryId: "vegetables", subcategory: "Fresh Vegetables", name: "Potato Agra", unit: "1 kg", uqc: "KGS", hsn: "0701", gstRate: 0, mrp: 31, aliases: ["aloo", "potato"] },
  { id: "onion-nashik", categoryId: "vegetables", subcategory: "Fresh Vegetables", name: "Onion Nashik", unit: "1 kg", uqc: "KGS", hsn: "0703", gstRate: 0, mrp: 42, aliases: ["pyaz", "onion"] },
  { id: "capsicum-green", categoryId: "vegetables", name: "Green Capsicum", unit: "500 g", uqc: "KGS", hsn: "0709", gstRate: 0, mrp: 48 },
  { id: "cauliflower", categoryId: "vegetables", name: "Cauliflower", unit: "1 pc", uqc: "PCS", hsn: "0704", gstRate: 0, mrp: 52 },
  { id: "coriander-bunch", categoryId: "vegetables", name: "Coriander Leaves", unit: "1 bunch", uqc: "PCS", hsn: "0709", gstRate: 0, mrp: 18, aliases: ["dhaniya"] },
  { id: "apple-shimla", categoryId: "fruits", subcategory: "Apples & Pears", name: "Apple Shimla", unit: "1 kg", uqc: "KGS", hsn: "0808", gstRate: 0, mrp: 180 },
  { id: "banana-robusta", categoryId: "fruits", name: "Banana Robusta", unit: "1 dozen", uqc: "DOZ", hsn: "0803", gstRate: 0, mrp: 62, aliases: ["kela"] },
  { id: "orange-nagpur", categoryId: "fruits", name: "Orange Nagpur", unit: "1 kg", uqc: "KGS", hsn: "0805", gstRate: 0, mrp: 110 },
  { id: "mango-alphonso", categoryId: "fruits", name: "Mango Alphonso", unit: "6 pcs", uqc: "PCS", hsn: "0804", gstRate: 0, mrp: 499 },
  { id: "milk-full-cream", categoryId: "dairy-eggs", subcategory: "Milk", name: "Full Cream Milk", brand: "Local Dairy", unit: "1 litre", uqc: "LTR", hsn: "0401", gstRate: 0, mrp: 68, fssaiApplicable: true },
  { id: "curd-fresh", categoryId: "dairy-eggs", name: "Fresh Curd", brand: "Local Dairy", unit: "400 g", uqc: "GMS", hsn: "0403", gstRate: 5, mrp: 48, fssaiApplicable: true },
  { id: "paneer-fresh", categoryId: "dairy-eggs", name: "Paneer Fresh", brand: "Local Dairy", unit: "200 g", uqc: "GMS", hsn: "0406", gstRate: 5, mrp: 92, fssaiApplicable: true },
  { id: "eggs-farm", categoryId: "dairy-eggs", name: "Farm Eggs", unit: "6 pcs", uqc: "PCS", hsn: "0407", gstRate: 0, mrp: 54, fssaiApplicable: true },
  { id: "chicken-curry-cut", categoryId: "meat-seafood", name: "Chicken Curry Cut", unit: "500 g", uqc: "GMS", hsn: "0207", gstRate: 0, mrp: 190, fssaiApplicable: true },
  { id: "mutton-curry-cut", categoryId: "meat-seafood", name: "Mutton Curry Cut", unit: "500 g", uqc: "GMS", hsn: "0204", gstRate: 0, mrp: 460, fssaiApplicable: true },
  { id: "fish-rohu", categoryId: "meat-seafood", name: "Rohu Fish Steak", unit: "500 g", uqc: "GMS", hsn: "0302", gstRate: 0, mrp: 210, fssaiApplicable: true },
  { id: "bread-multigrain", categoryId: "bakery", name: "Multigrain Bread", brand: "Morning Bake", unit: "400 g loaf", uqc: "GMS", hsn: "1905", gstRate: 5, mrp: 55, fssaiApplicable: true },
  { id: "pav-ladi", categoryId: "bakery", name: "Ladi Pav", brand: "Morning Bake", unit: "12 pcs", uqc: "PCS", hsn: "1905", gstRate: 5, mrp: 42, fssaiApplicable: true },
  { id: "cake-rusk", categoryId: "bakery", name: "Cake Rusk", unit: "200 g", uqc: "GMS", hsn: "1905", gstRate: 12, mrp: 75, fssaiApplicable: true },
  { id: "chips-salted", categoryId: "snacks", name: "Classic Salted Chips", brand: "Crispy", unit: "52 g", uqc: "GMS", hsn: "2005", gstRate: 12, mrp: 20, fssaiApplicable: true },
  { id: "namkeen-mixture", categoryId: "snacks", name: "Namkeen Mixture", brand: "Chatkara", unit: "400 g", uqc: "GMS", hsn: "2106", gstRate: 12, mrp: 105, fssaiApplicable: true },
  { id: "khakhra-methi", categoryId: "snacks", name: "Methi Khakhra", unit: "200 g", uqc: "GMS", hsn: "1905", gstRate: 12, mrp: 88, fssaiApplicable: true },
  { id: "cola-bottle", categoryId: "beverages", name: "Cola Bottle", brand: "FizzUp", unit: "750 ml", uqc: "MLT", hsn: "2202", gstRate: 28, mrp: 40, fssaiApplicable: true },
  { id: "mineral-water", categoryId: "beverages", name: "Mineral Water", brand: "AquaOne", unit: "1 litre", uqc: "LTR", hsn: "2201", gstRate: 18, mrp: 20, fssaiApplicable: true },
  { id: "tea-leaf", categoryId: "beverages", name: "Premium Tea Leaf", brand: "Chaika", unit: "250 g", uqc: "GMS", hsn: "0902", gstRate: 5, mrp: 165, fssaiApplicable: true },
  { id: "basmati-rice", categoryId: "staples", name: "Basmati Rice", brand: "Setu Select", unit: "1 kg", uqc: "KGS", hsn: "1006", gstRate: 5, mrp: 145, fssaiApplicable: true },
  { id: "wheat-atta", categoryId: "staples", name: "Whole Wheat Atta", brand: "Setu Chakki", unit: "5 kg", uqc: "KGS", hsn: "1101", gstRate: 5, mrp: 260, fssaiApplicable: true },
  { id: "sunflower-oil", categoryId: "staples", name: "Sunflower Oil", brand: "GoldLite", unit: "1 litre", uqc: "LTR", hsn: "1512", gstRate: 5, mrp: 155, fssaiApplicable: true },
  { id: "sugar", categoryId: "staples", name: "Sugar", unit: "1 kg", uqc: "KGS", hsn: "1701", gstRate: 5, mrp: 52, fssaiApplicable: true },
  { id: "toor-dal", categoryId: "pulses", name: "Toor Dal", brand: "Setu Select", unit: "1 kg", uqc: "KGS", hsn: "0713", gstRate: 5, mrp: 168, fssaiApplicable: true },
  { id: "moong-dal", categoryId: "pulses", name: "Moong Dal", brand: "Setu Select", unit: "1 kg", uqc: "KGS", hsn: "0713", gstRate: 5, mrp: 142, fssaiApplicable: true },
  { id: "chana-dal", categoryId: "pulses", name: "Chana Dal", brand: "Setu Select", unit: "1 kg", uqc: "KGS", hsn: "0713", gstRate: 5, mrp: 118, fssaiApplicable: true },
  { id: "turmeric-powder", categoryId: "spices", name: "Turmeric Powder", brand: "MasalaBox", unit: "100 g", uqc: "GMS", hsn: "0910", gstRate: 5, mrp: 44, fssaiApplicable: true, aliases: ["haldi"] },
  { id: "red-chilli-powder", categoryId: "spices", name: "Red Chilli Powder", brand: "MasalaBox", unit: "100 g", uqc: "GMS", hsn: "0904", gstRate: 5, mrp: 55, fssaiApplicable: true, aliases: ["mirchi"] },
  { id: "garam-masala", categoryId: "spices", name: "Garam Masala", brand: "MasalaBox", unit: "100 g", uqc: "GMS", hsn: "0910", gstRate: 5, mrp: 78, fssaiApplicable: true },
  { id: "mango-pickle", categoryId: "packaged-food", name: "Homemade Mango Pickle", unit: "250 g jar", uqc: "GMS", hsn: "2106", gstRate: 12, mrp: 149, fssaiApplicable: true },
  { id: "peanut-butter", categoryId: "packaged-food", name: "Crunchy Peanut Butter", brand: "NutriJar", unit: "340 g", uqc: "GMS", hsn: "2008", gstRate: 12, mrp: 189, fssaiApplicable: true },
  { id: "tomato-ketchup", categoryId: "packaged-food", name: "Tomato Ketchup", brand: "Saucy", unit: "500 g", uqc: "GMS", hsn: "2103", gstRate: 12, mrp: 115, fssaiApplicable: true },
  { id: "instant-noodles", categoryId: "instant-food", name: "Masala Instant Noodles", brand: "QuickBite", unit: "70 g", uqc: "GMS", hsn: "1902", gstRate: 12, mrp: 16, fssaiApplicable: true },
  { id: "poha-ready", categoryId: "instant-food", name: "Instant Poha Cup", brand: "QuickBite", unit: "80 g", uqc: "GMS", hsn: "1904", gstRate: 12, mrp: 45, fssaiApplicable: true },
  { id: "bath-soap", categoryId: "personal-care", name: "Bath Soap", brand: "FreshMe", unit: "4 x 75 g", uqc: "PCS", hsn: "3401", gstRate: 18, mrp: 96 },
  { id: "shampoo", categoryId: "personal-care", name: "Anti-Dandruff Shampoo", brand: "FreshMe", unit: "180 ml", uqc: "MLT", hsn: "3305", gstRate: 18, mrp: 155 },
  { id: "toothpaste", categoryId: "personal-care", name: "Herbal Toothpaste", brand: "SmileOn", unit: "150 g", uqc: "GMS", hsn: "3306", gstRate: 18, mrp: 92 },
  { id: "detergent-powder", categoryId: "home-care", name: "Detergent Powder", brand: "Sparkle", unit: "1 kg", uqc: "KGS", hsn: "3402", gstRate: 18, mrp: 112 },
  { id: "dishwash-gel", categoryId: "home-care", name: "Dishwash Gel", brand: "Sparkle", unit: "500 ml", uqc: "MLT", hsn: "3402", gstRate: 18, mrp: 109 },
  { id: "floor-cleaner", categoryId: "home-care", name: "Floor Cleaner", brand: "HomeGuard", unit: "1 litre", uqc: "LTR", hsn: "3402", gstRate: 18, mrp: 165 },
  { id: "garbage-bags", categoryId: "household", name: "Garbage Bags Medium", brand: "HomeGuard", unit: "30 bags", uqc: "PCS", hsn: "3923", gstRate: 18, mrp: 135 },
  { id: "aluminium-foil", categoryId: "household", name: "Aluminium Foil", brand: "KitchenMate", unit: "9 m roll", uqc: "MTR", hsn: "7607", gstRate: 18, mrp: 92 },
  { id: "baby-diapers", categoryId: "baby-care", name: "Baby Diapers M", brand: "TinyCare", unit: "20 pcs", uqc: "PCS", hsn: "9619", gstRate: 12, mrp: 299 },
  { id: "baby-wipes", categoryId: "baby-care", name: "Baby Wipes", brand: "TinyCare", unit: "72 wipes", uqc: "PCS", hsn: "3307", gstRate: 18, mrp: 115 },
  { id: "dog-food", categoryId: "pet-care", name: "Dog Food Chicken", brand: "PetBowl", unit: "1 kg", uqc: "KGS", hsn: "2309", gstRate: 18, mrp: 240 },
  { id: "cat-litter", categoryId: "pet-care", name: "Cat Litter", brand: "PetBowl", unit: "5 kg", uqc: "KGS", hsn: "3824", gstRate: 18, mrp: 430 },
  { id: "notebook", categoryId: "stationery", name: "Long Notebook", brand: "Classmate", unit: "172 pages", uqc: "PCS", hsn: "4820", gstRate: 12, mrp: 65 },
  { id: "ball-pen", categoryId: "stationery", name: "Blue Ball Pen", brand: "WriteWell", unit: "5 pcs", uqc: "PCS", hsn: "9608", gstRate: 12, mrp: 50 },
  { id: "usb-c-cable", categoryId: "electronics-accessories", name: "USB-C Cable", brand: "VoltGo", unit: "1 m", uqc: "PCS", hsn: "8544", gstRate: 18, mrp: 199 },
  { id: "earphones-wired", categoryId: "electronics-accessories", name: "Wired Earphones", brand: "VoltGo", unit: "1 pc", uqc: "PCS", hsn: "8518", gstRate: 18, mrp: 349 },
  { id: "mens-vest", categoryId: "fashion-basics", name: "Men's Cotton Vest", brand: "DailyWear", unit: "1 pc", uqc: "PCS", hsn: "6109", gstRate: 5, mrp: 149 },
  { id: "cotton-socks", categoryId: "fashion-basics", name: "Cotton Socks", brand: "DailyWear", unit: "3 pairs", uqc: "PRS", hsn: "6115", gstRate: 5, mrp: 129 },
  { id: "flip-flops", categoryId: "footwear", name: "Daily Flip Flops", brand: "StepEasy", unit: "1 pair", uqc: "PRS", hsn: "6402", gstRate: 12, mrp: 249 },
  { id: "school-shoes", categoryId: "footwear", name: "Black School Shoes", brand: "StepEasy", unit: "1 pair", uqc: "PRS", hsn: "6403", gstRate: 12, mrp: 699 },
  { id: "agarbatti-sandal", categoryId: "pooja", name: "Sandal Agarbatti", unit: "100 sticks", uqc: "PCS", hsn: "3307", gstRate: 12, mrp: 65 },
  { id: "diya-clay", categoryId: "pooja", name: "Clay Diya", unit: "12 pcs", uqc: "PCS", hsn: "6912", gstRate: 5, mrp: 60 },
  { id: "sanitizer", categoryId: "wellness", name: "Hand Sanitizer", brand: "CarePlus", unit: "100 ml", uqc: "MLT", hsn: "3808", gstRate: 18, mrp: 55 },
  { id: "digital-thermometer", categoryId: "wellness", name: "Digital Thermometer", brand: "CarePlus", unit: "1 pc", uqc: "PCS", hsn: "9025", gstRate: 12, mrp: 199 }
];

const sellers = [
  {
    id: "demo-seller-fresh",
    phone: "+919876544321",
    ownerName: "Nirmala Devi",
    shopName: "Nirmala's Kitchen",
    categories: ["vegetables", "dairy-eggs", "snacks", "packaged-food", "staples", "spices"],
    sla: [45, "minutes"] as const,
    autoInvoiceEnabled: true,
    deliveryFee: 29,
    location: { id: "demo-location-fresh", label: "Kurla Store", address: "Kurla West, Mumbai", city: "Mumbai", state: "Maharashtra", pincode: "400070", lat: 19.0726, lng: 72.8845, openTime: "08:00", closeTime: "22:00" },
    docs: [
      ["FSSAI", "APPROVED", "FSSAI-127220010001"] as const,
      ["GSTIN", "APPROVED", "27ABCDE1234F1Z5"] as const,
      ["BANK", "APPROVED", "HDFC **** 4421"] as const
    ],
    offers: ["tomato-hybrid", "potato-agra", "onion-nashik", "milk-full-cream", "paneer-fresh", "bread-multigrain", "chips-salted", "basmati-rice", "toor-dal", "turmeric-powder", "mango-pickle", "detergent-powder"]
  },
  {
    id: "demo-seller-meat",
    phone: "+919876544322",
    ownerName: "Imran Shaikh",
    shopName: "FreshCut Halal & Seafood",
    categories: ["meat-seafood", "dairy-eggs", "beverages"],
    sla: [2, "hours"] as const,
    autoInvoiceEnabled: false,
    deliveryFee: 39,
    location: { id: "demo-location-meat", label: "Bandra Counter", address: "Bandra East Market", city: "Mumbai", state: "Maharashtra", pincode: "400051", lat: 19.0596, lng: 72.8469, openTime: "10:00", closeTime: "21:30" },
    docs: [
      ["FSSAI", "PENDING", "FSSAI-127220020002"] as const,
      ["PAN", "APPROVED", "ABCDE1234F"] as const,
      ["BANK", "APPROVED", "ICICI **** 1808"] as const
    ],
    offers: ["chicken-curry-cut", "mutton-curry-cut", "fish-rohu", "eggs-farm", "mineral-water"]
  },
  {
    id: "demo-seller-home",
    phone: "+919876544323",
    ownerName: "Pooja Mehta",
    shopName: "Pooja Home Mart",
    categories: ["home-care", "household", "personal-care", "baby-care", "stationery", "pooja"],
    sla: [1, "days"] as const,
    autoInvoiceEnabled: true,
    deliveryFee: 19,
    location: { id: "demo-location-home", label: "Andheri Pickup", address: "Andheri East, MIDC", city: "Mumbai", state: "Maharashtra", pincode: "400093", lat: 19.1197, lng: 72.8468, openTime: "09:30", closeTime: "20:00" },
    docs: [
      ["GSTIN", "REJECTED", "GST image unclear"] as const,
      ["PAN", "APPROVED", "AABCP3344G"] as const,
      ["BANK", "PENDING", "Axis **** 6650"] as const
    ],
    offers: ["bath-soap", "shampoo", "toothpaste", "dishwash-gel", "floor-cleaner", "garbage-bags", "aluminium-foil", "baby-diapers", "notebook", "agarbatti-sandal"]
  },
  {
    id: "demo-seller-campus",
    phone: "+919876544324",
    ownerName: "Arjun Rao",
    shopName: "Campus Quick Needs",
    categories: ["snacks", "beverages", "instant-food", "electronics-accessories", "fashion-basics", "footwear", "wellness"],
    sla: [30, "minutes"] as const,
    autoInvoiceEnabled: true,
    deliveryFee: 15,
    location: { id: "demo-location-campus", label: "Powai Cart", address: "Powai Lake Road", city: "Mumbai", state: "Maharashtra", pincode: "400076", lat: 19.1176, lng: 72.906, openTime: "07:00", closeTime: "23:30" },
    docs: [
      ["PAN", "APPROVED", "BBQPR7788L"] as const,
      ["BANK", "APPROVED", "UPI arjun@upi"] as const
    ],
    offers: ["chips-salted", "namkeen-mixture", "cola-bottle", "instant-noodles", "poha-ready", "usb-c-cable", "earphones-wired", "cotton-socks", "flip-flops", "sanitizer"]
  }
];

function nowPlusMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60_000);
}

function nowMinusMinutes(minutes: number) {
  return new Date(Date.now() - minutes * 60_000);
}

function productImage(id: string) {
  return `demo://bazaar-setu/products/${id}.svg`;
}

async function seedCategoriesAndProducts() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: { name: category.name, icon: category.icon },
      create: category
    });
  }

  for (const product of products) {
    const legalMetrology: Prisma.InputJsonValue = {
      netQuantity: product.unit,
      mrp: product.mrp,
      countryOfOrigin: "India",
      consumerCare: "Bazaar Setu Support",
      expiryOrBestBefore: product.fssaiApplicable ? "See pack/date label" : undefined
    };
    const data = {
      categoryId: product.categoryId,
      subcategory: product.subcategory,
      name: product.name,
      brand: product.brand,
      unit: product.unit,
      uqc: product.uqc,
      hsn: product.hsn,
      gstRate: product.gstRate,
      imageUrl: productImage(product.id),
      aliases: [...new Set([product.name.toLowerCase(), product.categoryId.replaceAll("-", " "), ...(product.aliases ?? [])])],
      fssaiApplicable: product.fssaiApplicable ?? ["dairy-eggs", "meat-seafood", "packaged-food", "instant-food", "snacks", "beverages", "staples", "pulses", "spices"].includes(product.categoryId),
      legalMetrology,
      active: true
    };
    await prisma.productMaster.upsert({
      where: { id: product.id },
      update: data,
      create: { id: product.id, ...data }
    });
  }
}

async function seedUsersAndSellers() {
  await prisma.user.upsert({
    where: { phone: "+919000000001" },
    update: { role: "ADMIN", name: "Asha Ops Admin", email: "admin@bazaarsetu.demo" },
    create: { phone: "+919000000001", role: "ADMIN", name: "Asha Ops Admin", email: "admin@bazaarsetu.demo" }
  });
  await prisma.user.upsert({
    where: { phone: "+919000000002" },
    update: { role: "SUPPORT", name: "Vikram Support", email: "support@bazaarsetu.demo" },
    create: { phone: "+919000000002", role: "SUPPORT", name: "Vikram Support", email: "support@bazaarsetu.demo" }
  });

  for (const sellerSeed of sellers) {
    const user = await prisma.user.upsert({
      where: { phone: sellerSeed.phone },
      update: { role: "SELLER", name: sellerSeed.ownerName },
      create: { phone: sellerSeed.phone, role: "SELLER", name: sellerSeed.ownerName }
    });
    const seller = await prisma.sellerProfile.upsert({
      where: { id: sellerSeed.id },
      update: {
        userId: user.id,
        ownerName: sellerSeed.ownerName,
        shopName: sellerSeed.shopName,
        storeLive: sellerSeed.id !== "demo-seller-home",
        selectedCategoryIds: sellerSeed.categories,
        defaultSlaValue: sellerSeed.sla[0],
        defaultSlaUnit: sellerSeed.sla[1],
        autoInvoiceEnabled: sellerSeed.autoInvoiceEnabled,
        deliveryFee: sellerSeed.deliveryFee
      },
      create: {
        id: sellerSeed.id,
        userId: user.id,
        ownerName: sellerSeed.ownerName,
        shopName: sellerSeed.shopName,
        storeLive: sellerSeed.id !== "demo-seller-home",
        selectedCategoryIds: sellerSeed.categories,
        defaultSlaValue: sellerSeed.sla[0],
        defaultSlaUnit: sellerSeed.sla[1],
        autoInvoiceEnabled: sellerSeed.autoInvoiceEnabled,
        deliveryFee: sellerSeed.deliveryFee
      }
    });
    await prisma.sellerLocation.upsert({
      where: { id: sellerSeed.location.id },
      update: { sellerId: seller.id, ...sellerSeed.location, active: true },
      create: { sellerId: seller.id, ...sellerSeed.location, active: true }
    });

    for (const [type, status, identifier] of sellerSeed.docs) {
      await prisma.complianceDocument.upsert({
        where: { id: `${sellerSeed.id}-${type.toLowerCase()}` },
        update: {
          sellerId: seller.id,
          type: type as DocumentType,
          identifier,
          status: status as ApprovalStatus,
          reason: status === "REJECTED" ? identifier : undefined,
          fileUrl: `demo://bazaar-setu/docs/${sellerSeed.id}/${type.toLowerCase()}.pdf`
        },
        create: {
          id: `${sellerSeed.id}-${type.toLowerCase()}`,
          sellerId: seller.id,
          type: type as DocumentType,
          identifier,
          status: status as ApprovalStatus,
          reason: status === "REJECTED" ? identifier : undefined,
          fileUrl: `demo://bazaar-setu/docs/${sellerSeed.id}/${type.toLowerCase()}.pdf`
        }
      });
    }

    for (const [index, productId] of sellerSeed.offers.entries()) {
      const master = products.find((product) => product.id === productId);
      await prisma.sellerProduct.upsert({
        where: { id: `demo-offer-${sellerSeed.id}-${productId}` },
        update: {
          sellerId: seller.id,
          productId,
          price: Math.max(1, (master?.mrp ?? 100) - (index % 3) * 4),
          qty: index % 5 === 0 ? 5 : 18 + index * 2,
          active: sellerSeed.id !== "demo-seller-home" || index < 7,
          tags: index % 2 === 0 ? ["Quick Delivery", "Best Seller"] : ["Standard Delivery"],
          slaOverrideValue: index % 4 === 0 ? 30 : undefined,
          slaOverrideUnit: index % 4 === 0 ? "minutes" : undefined
        },
        create: {
          id: `demo-offer-${sellerSeed.id}-${productId}`,
          sellerId: seller.id,
          productId,
          price: Math.max(1, (master?.mrp ?? 100) - (index % 3) * 4),
          qty: index % 5 === 0 ? 5 : 18 + index * 2,
          active: sellerSeed.id !== "demo-seller-home" || index < 7,
          tags: index % 2 === 0 ? ["Quick Delivery", "Best Seller"] : ["Standard Delivery"],
          slaOverrideValue: index % 4 === 0 ? 30 : undefined,
          slaOverrideUnit: index % 4 === 0 ? "minutes" : undefined
        }
      });
    }
  }
}

async function seedCustomers() {
  const customers = [
    { userId: "demo-customer-user", profileId: "demo-customer", phone: "+919876543210", name: "Rahul Kumar", rewardPoints: 420, addressId: "demo-home-address", label: "Andheri (E)", line1: "Home - 17, Namam Premier, Marol", city: "Mumbai", state: "Maharashtra", pincode: "400059", lat: 19.1197, lng: 72.8468 },
    { userId: "demo-customer-user-2", profileId: "demo-customer-ria", phone: "+919876543211", name: "Ria Shah", rewardPoints: 180, addressId: "demo-office-address", label: "BKC Office", line1: "Tower B, Bandra Kurla Complex", city: "Mumbai", state: "Maharashtra", pincode: "400051", lat: 19.0676, lng: 72.8676 },
    { userId: "demo-customer-user-3", profileId: "demo-customer-aman", phone: "+919876543212", name: "Aman Verma", rewardPoints: 80, addressId: "demo-hostel-address", label: "Powai Hostel", line1: "Hostel Block 4, Powai", city: "Mumbai", state: "Maharashtra", pincode: "400076", lat: 19.1176, lng: 72.906 }
  ];

  for (const customer of customers) {
    const user = await prisma.user.upsert({
      where: { phone: customer.phone },
      update: { role: "CUSTOMER", name: customer.name },
      create: { id: customer.userId, phone: customer.phone, role: "CUSTOMER", name: customer.name }
    });
    await prisma.customerProfile.upsert({
      where: { id: customer.profileId },
      update: { userId: user.id, rewardPoints: customer.rewardPoints },
      create: { id: customer.profileId, userId: user.id, rewardPoints: customer.rewardPoints }
    });
    await prisma.customerAddress.upsert({
      where: { id: customer.addressId },
      update: {
        customerId: customer.profileId,
        type: customer.addressId.includes("office") ? "office" : "home",
        label: customer.label,
        line1: customer.line1,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
        lat: customer.lat,
        lng: customer.lng
      },
      create: {
        id: customer.addressId,
        customerId: customer.profileId,
        type: customer.addressId.includes("office") ? "office" : "home",
        label: customer.label,
        line1: customer.line1,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
        lat: customer.lat,
        lng: customer.lng
      }
    });
  }
}

async function createOrder(input: {
  id: string;
  customerId: string;
  addressId: string;
  status: OrderStatus;
  paymentState: PaymentState;
  paymentMethod: string;
  deliveryFee: number;
  createdAt: Date;
  subOrders: Array<{
    id: string;
    sellerId: string;
    status: OrderStatus;
    paymentState: PaymentState;
    invoiceNumber?: string;
    invoiceMode?: string;
    rejectReason?: string;
    refundAmount?: number;
    slaDueAt?: Date;
    timeline: Prisma.InputJsonValue;
    items: Array<{ productId: string; qty: number }>;
  }>;
}) {
  const productIds = input.subOrders.flatMap((subOrder) => subOrder.items.map((item) => item.productId));
  const offerIds = input.subOrders.flatMap((subOrder) => subOrder.items.map((item) => `demo-offer-${subOrder.sellerId}-${item.productId}`));
  const [masters, offers] = await Promise.all([
    prisma.productMaster.findMany({ where: { id: { in: productIds } } }),
    prisma.sellerProduct.findMany({ where: { id: { in: offerIds } } })
  ]);
  const masterMap = new Map(masters.map((product) => [product.id, product]));
  const offerMap = new Map(offers.map((offer) => [offer.id, offer]));
  const total = input.subOrders.reduce((sum, subOrder) => {
    return sum + subOrder.items.reduce((itemSum, item) => {
      const offer = offerMap.get(`demo-offer-${subOrder.sellerId}-${item.productId}`);
      return itemSum + (offer?.price ?? 0) * item.qty;
    }, 0);
  }, 0);

  await prisma.parentOrder.create({
    data: {
      id: input.id,
      customerId: input.customerId,
      addressId: input.addressId,
      status: input.status,
      paymentState: input.paymentState,
      paymentMethod: input.paymentMethod,
      total,
      deliveryFee: input.deliveryFee,
      createdAt: input.createdAt,
      subOrders: {
        create: input.subOrders.map((subOrder) => ({
          id: subOrder.id,
          sellerId: subOrder.sellerId,
          status: subOrder.status,
          paymentState: subOrder.paymentState,
          invoiceNumber: subOrder.invoiceNumber,
          invoiceMode: subOrder.invoiceMode,
          rejectReason: subOrder.rejectReason,
          refundAmount: subOrder.refundAmount,
          slaDueAt: subOrder.slaDueAt,
          createdAt: input.createdAt,
          timeline: subOrder.timeline,
          items: {
            create: subOrder.items.map((item) => {
              const product = masterMap.get(item.productId);
              const offer = offerMap.get(`demo-offer-${subOrder.sellerId}-${item.productId}`);
              if (!product || !offer) throw new Error(`Missing demo product or offer for ${item.productId}.`);
              return {
                productId: product.id,
                sellerProduct: { connect: { id: offer.id } },
                name: product.name,
                hsn: product.hsn,
                unit: product.unit,
                qty: item.qty,
                price: offer.price,
                taxAmount: product.gstRate ? Math.round((offer.price * item.qty * Number(product.gstRate)) / 100) : 0
              };
            })
          }
        }))
      }
    }
  });
}

async function seedOrders() {
  const parentOrderIds = ["demo-order-1001", "demo-order-1002", "demo-order-1003", "demo-order-1004", "demo-order-1005", "demo-order-1006"];
  const subOrderIds = ["demo-sub-1001-a", "demo-sub-1001-b", "demo-sub-1002-a", "demo-sub-1003-a", "demo-sub-1004-a", "demo-sub-1005-a", "demo-sub-1006-a"];
  await prisma.orderItem.deleteMany({ where: { subOrderId: { in: subOrderIds } } });
  await prisma.sellerSubOrder.deleteMany({ where: { id: { in: subOrderIds } } });
  await prisma.parentOrder.deleteMany({ where: { id: { in: parentOrderIds } } });

  await createOrder({
    id: "demo-order-1001",
    customerId: "demo-customer",
    addressId: "demo-home-address",
    status: "PLACED",
    paymentState: "PAID",
    paymentMethod: "upi",
    deliveryFee: 68,
    createdAt: nowMinusMinutes(18),
    subOrders: [
      {
        id: "demo-sub-1001-a",
        sellerId: "demo-seller-fresh",
        status: "PLACED",
        paymentState: "PAID",
        slaDueAt: nowPlusMinutes(22),
        timeline: [{ status: "PLACED", at: nowMinusMinutes(18).toISOString(), note: "Customer placed multi-seller order." }],
        items: [{ productId: "tomato-hybrid", qty: 2 }, { productId: "milk-full-cream", qty: 1 }]
      },
      {
        id: "demo-sub-1001-b",
        sellerId: "demo-seller-campus",
        status: "BAG_PACKED",
        paymentState: "PAID",
        invoiceNumber: "BS-DEMO-A91K",
        invoiceMode: "auto",
        slaDueAt: nowPlusMinutes(10),
        timeline: [
          { status: "PLACED", at: nowMinusMinutes(18).toISOString() },
          { status: "BAG_PACKED", at: nowMinusMinutes(5).toISOString(), note: "Auto invoice generated and bag packed." }
        ],
        items: [{ productId: "instant-noodles", qty: 3 }, { productId: "cola-bottle", qty: 1 }]
      }
    ]
  });

  await createOrder({
    id: "demo-order-1002",
    customerId: "demo-customer-ria",
    addressId: "demo-office-address",
    status: "CANCELLED",
    paymentState: "REFUND_PENDING",
    paymentMethod: "card",
    deliveryFee: 39,
    createdAt: nowMinusMinutes(76),
    subOrders: [{
      id: "demo-sub-1002-a",
      sellerId: "demo-seller-meat",
      status: "REJECTED",
      paymentState: "REFUND_PENDING",
      rejectReason: "Fresh fish batch failed quality check.",
      refundAmount: 210,
      slaDueAt: nowMinusMinutes(16),
      timeline: [
        { status: "PLACED", at: nowMinusMinutes(76).toISOString() },
        { status: "REJECTED", at: nowMinusMinutes(48).toISOString(), note: "Seller rejected with reason." }
      ],
      items: [{ productId: "fish-rohu", qty: 1 }]
    }]
  });

  await createOrder({
    id: "demo-order-1003",
    customerId: "demo-customer-aman",
    addressId: "demo-hostel-address",
    status: "DELIVERED",
    paymentState: "COD",
    paymentMethod: "cod",
    deliveryFee: 15,
    createdAt: nowMinusMinutes(240),
    subOrders: [{
      id: "demo-sub-1003-a",
      sellerId: "demo-seller-campus",
      status: "DELIVERED",
      paymentState: "COD",
      invoiceNumber: "BS-DEMO-82QZ",
      invoiceMode: "auto",
      slaDueAt: nowMinusMinutes(180),
      timeline: [
        { status: "PLACED", at: nowMinusMinutes(240).toISOString() },
        { status: "BAG_PACKED", at: nowMinusMinutes(225).toISOString() },
        { status: "HANDED_OVER", at: nowMinusMinutes(206).toISOString() },
        { status: "DELIVERED", at: nowMinusMinutes(195).toISOString() }
      ],
      items: [{ productId: "chips-salted", qty: 2 }, { productId: "usb-c-cable", qty: 1 }]
    }]
  });

  await createOrder({
    id: "demo-order-1004",
    customerId: "demo-customer-ria",
    addressId: "demo-office-address",
    status: "CONFIRMED",
    paymentState: "PAID",
    paymentMethod: "wallet",
    deliveryFee: 39,
    createdAt: nowMinusMinutes(38),
    subOrders: [{
      id: "demo-sub-1004-a",
      sellerId: "demo-seller-meat",
      status: "INVOICE_REQUIRED",
      paymentState: "PAID",
      slaDueAt: nowPlusMinutes(65),
      timeline: [
        { status: "PLACED", at: nowMinusMinutes(38).toISOString() },
        { status: "CONFIRMED", at: nowMinusMinutes(29).toISOString(), note: "Manual invoice required because seller disabled auto invoicing." }
      ],
      items: [{ productId: "chicken-curry-cut", qty: 1 }, { productId: "eggs-farm", qty: 1 }]
    }]
  });

  await createOrder({
    id: "demo-order-1005",
    customerId: "demo-customer",
    addressId: "demo-home-address",
    status: "CONFIRMED",
    paymentState: "PAID",
    paymentMethod: "upi",
    deliveryFee: 29,
    createdAt: nowMinusMinutes(92),
    subOrders: [{
      id: "demo-sub-1005-a",
      sellerId: "demo-seller-fresh",
      status: "HANDED_OVER",
      paymentState: "PAID",
      invoiceNumber: "BS-DEMO-L7XP",
      invoiceMode: "auto",
      slaDueAt: nowMinusMinutes(12),
      timeline: [
        { status: "PLACED", at: nowMinusMinutes(92).toISOString() },
        { status: "BAG_PACKED", at: nowMinusMinutes(62).toISOString() },
        { status: "HANDED_OVER", at: nowMinusMinutes(20).toISOString(), note: "Awaiting delivery partner scan." }
      ],
      items: [{ productId: "basmati-rice", qty: 1 }, { productId: "toor-dal", qty: 1 }, { productId: "mango-pickle", qty: 1 }]
    }]
  });

  await createOrder({
    id: "demo-order-1006",
    customerId: "demo-customer-aman",
    addressId: "demo-hostel-address",
    status: "REFUNDED",
    paymentState: "REFUNDED",
    paymentMethod: "upi",
    deliveryFee: 19,
    createdAt: nowMinusMinutes(480),
    subOrders: [{
      id: "demo-sub-1006-a",
      sellerId: "demo-seller-home",
      status: "REFUNDED",
      paymentState: "REFUNDED",
      rejectReason: "Store was disabled during document review.",
      refundAmount: 155,
      slaDueAt: nowMinusMinutes(420),
      timeline: [
        { status: "PLACED", at: nowMinusMinutes(480).toISOString() },
        { status: "CANCELLED", at: nowMinusMinutes(455).toISOString() },
        { status: "REFUNDED", at: nowMinusMinutes(430).toISOString() }
      ],
      items: [{ productId: "floor-cleaner", qty: 1 }]
    }]
  });
}

type DemoSupportTicket = {
  ticketNumber: string;
  source: SupportTicketSource;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  category: string;
  subCategory?: string;
  subject: string;
  description: string;
  customerId?: string;
  sellerId?: string;
  parentOrderId?: string;
  subOrderId?: string;
  createdByUserId?: string;
  assignedToUserId?: string;
  slaDueAt: Date;
  metadata?: Prisma.InputJsonValue;
  messages: Array<{
    authorRole: string;
    visibility: SupportMessageVisibility;
    message: string;
    createdAt: Date;
  }>;
};

async function seedSupportTickets() {
  const supportUser = await prisma.user.findUnique({ where: { phone: "+919000000002" } });
  const sellerFreshUser = await prisma.user.findUnique({ where: { phone: "+919876544321" } });
  const sellerMeatUser = await prisma.user.findUnique({ where: { phone: "+919876544322" } });

  const tickets: DemoSupportTicket[] = [
    {
      ticketNumber: "BST-DEMO-1001",
      source: "CUSTOMER",
      status: "WAITING_DELIVERY",
      priority: "HIGH",
      category: "late_order",
      subCategory: "handover_delay",
      subject: "Customer waiting after seller handover",
      description: "Order says handed over but the delivery partner has not arrived at my address.",
      customerId: "demo-customer",
      sellerId: "demo-seller-fresh",
      parentOrderId: "demo-order-1005",
      subOrderId: "demo-sub-1005-a",
      createdByUserId: "demo-customer-user",
      assignedToUserId: supportUser?.id,
      slaDueAt: nowPlusMinutes(20),
      metadata: { channel: "customer_app", preferredContact: "call", addressLabel: "Andheri (E)" },
      messages: [
        { authorRole: "CUSTOMER", visibility: "CUSTOMER", message: "Please check delivery status. It is already beyond the shown SLA.", createdAt: nowMinusMinutes(18) },
        { authorRole: "SUPPORT", visibility: "CUSTOMER", message: "We are checking with logistics and will update you shortly.", createdAt: nowMinusMinutes(10) },
        { authorRole: "SUPPORT", visibility: "INTERNAL", message: "Call delivery partner and validate last scan for demo-sub-1005-a.", createdAt: nowMinusMinutes(8) }
      ]
    },
    {
      ticketNumber: "BST-DEMO-1002",
      source: "SELLER",
      status: "WAITING_DELIVERY",
      priority: "HIGH",
      category: "delivery_exception",
      subCategory: "pickup_delay",
      subject: "Courier partner not assigned",
      description: "Manual invoice order is ready but no delivery partner is assigned for pickup.",
      customerId: "demo-customer-ria",
      sellerId: "demo-seller-meat",
      parentOrderId: "demo-order-1004",
      subOrderId: "demo-sub-1004-a",
      createdByUserId: sellerMeatUser?.id,
      assignedToUserId: supportUser?.id,
      slaDueAt: nowPlusMinutes(45),
      metadata: { channel: "seller_app", pickupLocation: "Bandra Counter" },
      messages: [
        { authorRole: "SELLER", visibility: "SELLER", message: "Order is prepared. Need pickup assignment quickly because fresh items are packed.", createdAt: nowMinusMinutes(14) },
        { authorRole: "SUPPORT", visibility: "SELLER", message: "Ops is checking available delivery riders near Bandra.", createdAt: nowMinusMinutes(5) }
      ]
    },
    {
      ticketNumber: "BST-DEMO-1003",
      source: "SYSTEM",
      status: "REFUND_REVIEW",
      priority: "CRITICAL",
      category: "refund",
      subCategory: "prepaid_rejection",
      subject: "Prepaid rejected order needs refund closure",
      description: "Seller rejected a prepaid order. Refund is pending customer closure.",
      customerId: "demo-customer-ria",
      sellerId: "demo-seller-meat",
      parentOrderId: "demo-order-1002",
      subOrderId: "demo-sub-1002-a",
      assignedToUserId: supportUser?.id,
      slaDueAt: nowPlusMinutes(10),
      metadata: { refundAmount: 210, paymentMethod: "card", rejectReason: "Fresh fish batch failed quality check." },
      messages: [
        { authorRole: "SYSTEM", visibility: "INTERNAL", message: "Refund pending after seller rejection. Verify payment gateway state and close refund.", createdAt: nowMinusMinutes(48) },
        { authorRole: "SUPPORT", visibility: "CUSTOMER", message: "Your refund has been queued and will be updated after payment gateway confirmation.", createdAt: nowMinusMinutes(32) }
      ]
    },
    {
      ticketNumber: "BST-DEMO-1004",
      source: "SELLER",
      status: "ASSIGNED",
      priority: "MEDIUM",
      category: "print_issue",
      subCategory: "thermal_label",
      subject: "80mm label text is not fitting",
      description: "Seller needs help printing the customer label in 80mm thermal size.",
      customerId: "demo-customer",
      sellerId: "demo-seller-fresh",
      parentOrderId: "demo-order-1001",
      subOrderId: "demo-sub-1001-a",
      createdByUserId: sellerFreshUser?.id,
      assignedToUserId: supportUser?.id,
      slaDueAt: nowPlusMinutes(180),
      metadata: { channel: "seller_app", printerSize: "80mm thermal" },
      messages: [
        { authorRole: "SELLER", visibility: "SELLER", message: "Thermal label is cutting customer address. Need alternate size.", createdAt: nowMinusMinutes(28) },
        { authorRole: "SUPPORT", visibility: "SELLER", message: "Try 4x6 for this shipment while we inspect thermal formatting.", createdAt: nowMinusMinutes(20) }
      ]
    }
  ];

  for (const ticket of tickets) {
    await prisma.supportTicket.upsert({
      where: { ticketNumber: ticket.ticketNumber },
      update: {
        source: ticket.source,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        subCategory: ticket.subCategory,
        subject: ticket.subject,
        description: ticket.description,
        customerId: ticket.customerId,
        sellerId: ticket.sellerId,
        parentOrderId: ticket.parentOrderId,
        subOrderId: ticket.subOrderId,
        createdByUserId: ticket.createdByUserId,
        assignedToUserId: ticket.assignedToUserId,
        slaDueAt: ticket.slaDueAt,
        metadata: ticket.metadata,
        messages: {
          deleteMany: {},
          create: ticket.messages
        }
      },
      create: {
        ticketNumber: ticket.ticketNumber,
        source: ticket.source,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        subCategory: ticket.subCategory,
        subject: ticket.subject,
        description: ticket.description,
        customerId: ticket.customerId,
        sellerId: ticket.sellerId,
        parentOrderId: ticket.parentOrderId,
        subOrderId: ticket.subOrderId,
        createdByUserId: ticket.createdByUserId,
        assignedToUserId: ticket.assignedToUserId,
        slaDueAt: ticket.slaDueAt,
        metadata: ticket.metadata,
        messages: {
          create: ticket.messages
        }
      }
    });
  }
}

async function seedQueuesAndSettings() {
  const requests = [
    { id: "demo-product-request-1", sellerId: "demo-seller-fresh", categoryId: "packaged-food", name: "Handmade Garlic Chutney", unit: "200 g jar", hsn: "2103", imageUrl: "demo://bazaar-setu/uploads/garlic-chutney.jpg", status: "PENDING" as ApprovalStatus, aiExtractedFields: { name: "Garlic Chutney", unit: "200 g", fssaiLikely: true } },
    { id: "demo-product-request-2", sellerId: "demo-seller-campus", categoryId: "electronics-accessories", name: "Fast Charger 20W", unit: "1 pc", hsn: "8504", imageUrl: "demo://bazaar-setu/uploads/charger-20w.jpg", status: "PENDING" as ApprovalStatus, aiExtractedFields: { name: "20W Charger", category: "Electronics Accessories" } },
    { id: "demo-product-request-3", sellerId: "demo-seller-home", categoryId: "home-care", name: "Loose Phenyl Bottle", unit: "1 litre", hsn: "3808", imageUrl: "demo://bazaar-setu/uploads/phenyl.jpg", status: "REJECTED" as ApprovalStatus, reason: "Label image missing MRP and manufacturer details.", aiExtractedFields: { missing: ["MRP", "manufacturer"] } }
  ];
  for (const request of requests) {
    await prisma.productApprovalRequest.upsert({
      where: { id: request.id },
      update: request,
      create: request
    });
  }

  await prisma.platformSetting.upsert({
    where: { key: "paymentConfig" },
    update: {
      value: {
        vendors: [
          { id: "razorpay-upi", label: "UPI via Razorpay", enabled: true },
          { id: "razorpay-cards", label: "Cards via Razorpay", enabled: true },
          { id: "phonepe", label: "PhonePe PG", enabled: false },
          { id: "wallet", label: "Bazaar Setu Wallet", enabled: true },
          { id: "cod", label: "Cash on Delivery", enabled: true }
        ]
      }
    },
    create: {
      key: "paymentConfig",
      value: {
        vendors: [
          { id: "razorpay-upi", label: "UPI via Razorpay", enabled: true },
          { id: "razorpay-cards", label: "Cards via Razorpay", enabled: true },
          { id: "phonepe", label: "PhonePe PG", enabled: false },
          { id: "wallet", label: "Bazaar Setu Wallet", enabled: true },
          { id: "cod", label: "Cash on Delivery", enabled: true }
        ]
      }
    }
  });

  await prisma.platformSetting.upsert({
    where: { key: "rewardConfig" },
    update: { value: { enabled: true, pointsPerHundred: 2, welcomeBonus: 25, sellerReferralBonus: 100 } },
    create: { key: "rewardConfig", value: { enabled: true, pointsPerHundred: 2, welcomeBonus: 25, sellerReferralBonus: 100 } }
  });

  const notifications = [
    { id: "demo-notification-offer", audience: "customer", type: "offer", title: "Fresh local deals are live", body: "Order from nearby sellers and earn 2x Bazaar Setu reward points today." },
    { id: "demo-notification-seller", audience: "seller", type: "system", title: "Peak hour alert", body: "Keep inventory updated between 6 PM and 9 PM to avoid stock-out cancellations." },
    { id: "demo-notification-refund", audience: "admin", type: "refund", title: "Refund desk review", body: "One prepaid rejected order is waiting for refund completion." }
  ];
  for (const notification of notifications) {
    await prisma.notification.upsert({
      where: { id: notification.id },
      update: notification,
      create: notification
    });
  }

  const leads = [
    { id: "demo-seller-lead", customerId: "demo-customer", name: "Rahul Kumar", phone: "+919876543210", notes: "Customer wants to onboard a weekend fruit stall.", status: "NEW" },
    { id: "demo-seller-lead-2", customerId: "demo-customer-ria", name: "Ria Shah", phone: "+919876543211", notes: "Office pantry vendor interested in bulk snacks.", status: "CONTACTED" },
    { id: "demo-seller-lead-3", customerId: "demo-customer-aman", name: "Aman Verma", phone: "+919876543212", notes: "Hostel laundry and essentials cart lead.", status: "NEW" }
  ];
  for (const lead of leads) {
    await prisma.sellerLead.upsert({
      where: { id: lead.id },
      update: lead,
      create: lead
    });
  }
}

async function main() {
  await seedCategoriesAndProducts();
  await seedUsersAndSellers();
  await seedCustomers();
  await seedOrders();
  await seedSupportTickets();
  await seedQueuesAndSettings();
  console.log(`Seeded Bazaar Setu demo data: ${categories.length} categories, ${products.length} products, ${sellers.length} sellers.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
