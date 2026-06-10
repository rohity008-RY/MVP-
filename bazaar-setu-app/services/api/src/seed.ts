import { prisma } from "./db.js";

const categories: Array<{ id: string; name: string; icon: string }> = [
  { id: "fruits", name: "Fruits", icon: "apple" },
  { id: "vegetables", name: "Vegetables", icon: "leaf" },
  { id: "dairy", name: "Dairy & Eggs", icon: "milk" },
  { id: "meat-seafood", name: "Meat & Seafood", icon: "meat" },
  { id: "bakery", name: "Bakery", icon: "bread" },
  { id: "snacks", name: "Snacks", icon: "snack" },
  { id: "beverages", name: "Beverages", icon: "drink" },
  { id: "staples", name: "Staples", icon: "rice" },
  { id: "pulses", name: "Pulses & Dal", icon: "dal" },
  { id: "spices", name: "Masala & Spices", icon: "spice" },
  { id: "packaged-food", name: "Packaged Food", icon: "jar" },
  { id: "home-care", name: "Home Care", icon: "clean" },
  { id: "personal-care", name: "Personal Care", icon: "care" },
  { id: "baby-care", name: "Baby Care", icon: "baby" },
  { id: "pet-care", name: "Pet Care", icon: "pet" },
  { id: "pooja", name: "Pooja Items", icon: "diya" }
];

const products: Array<{ id: string; name: string; categoryId: string; unit: string; hsn?: string; mrp: number }> = [
  { id: "tomato", name: "Tomato Hybrid", categoryId: "vegetables", unit: "1 kg", hsn: "0702", mrp: 34 },
  { id: "potato", name: "Potato Agra", categoryId: "vegetables", unit: "1 kg", hsn: "0701", mrp: 31 },
  { id: "onion", name: "Onion Nashik", categoryId: "vegetables", unit: "1 kg", hsn: "0703", mrp: 42 },
  { id: "apple", name: "Apple Shimla", categoryId: "fruits", unit: "1 kg", hsn: "0808", mrp: 180 },
  { id: "banana", name: "Banana Robusta", categoryId: "fruits", unit: "1 dozen", hsn: "0803", mrp: 62 },
  { id: "milk", name: "Full Cream Milk", categoryId: "dairy", unit: "1 litre", hsn: "0401", mrp: 68 },
  { id: "paneer", name: "Paneer Fresh", categoryId: "dairy", unit: "200 g", hsn: "0406", mrp: 92 },
  { id: "chicken-curry-cut", name: "Chicken Curry Cut", categoryId: "meat-seafood", unit: "500 g", hsn: "0207", mrp: 190 },
  { id: "bread", name: "Multigrain Bread", categoryId: "bakery", unit: "400 g loaf", hsn: "1905", mrp: 55 },
  { id: "chips", name: "Classic Salted Chips", categoryId: "snacks", unit: "52 g", hsn: "2005", mrp: 20 },
  { id: "cola", name: "Cola Bottle", categoryId: "beverages", unit: "750 ml", hsn: "2202", mrp: 40 },
  { id: "rice", name: "Basmati Rice", categoryId: "staples", unit: "1 kg", hsn: "1006", mrp: 145 },
  { id: "toor-dal", name: "Toor Dal", categoryId: "pulses", unit: "1 kg", hsn: "0713", mrp: 168 },
  { id: "turmeric", name: "Turmeric Powder", categoryId: "spices", unit: "100 g", hsn: "0910", mrp: 44 },
  { id: "mango-pickle", name: "Homemade Mango Pickle", categoryId: "packaged-food", unit: "250 g jar", hsn: "2106", mrp: 149 },
  { id: "detergent", name: "Detergent Powder", categoryId: "home-care", unit: "1 kg", hsn: "3402", mrp: 112 },
  { id: "soap", name: "Bath Soap", categoryId: "personal-care", unit: "4 x 75 g", hsn: "3401", mrp: 96 },
  { id: "agarbatti", name: "Agarbatti Sandal", categoryId: "pooja", unit: "100 sticks", hsn: "3307", mrp: 65 }
];

async function main() {
  for (const { id, name, icon } of categories) {
    await prisma.category.upsert({ where: { id }, update: {}, create: { id, name, icon } });
  }

  for (const { id, name, categoryId, unit, hsn, mrp } of products) {
    await prisma.productMaster.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name,
        categoryId,
        unit,
        hsn,
        gstRate: hsn ? 5 : undefined,
        aliases: [String(name).toLowerCase(), String(categoryId).replace("-", " ")],
        fssaiApplicable: ["dairy", "meat-seafood", "packaged-food"].includes(String(categoryId)),
        legalMetrology: { netQuantity: unit, mrp, countryOfOrigin: "India", consumerCare: "Bazaar Setu Support" }
      }
    });
  }

  const customerUser = await prisma.user.upsert({
    where: { phone: "+919876543210" },
    update: {},
    create: { phone: "+919876543210", role: "CUSTOMER", name: "Rahul Kumar" }
  });
  const customer = await prisma.customerProfile.upsert({
    where: { id: "demo-customer" },
    update: {},
    create: { id: "demo-customer", userId: customerUser.id, rewardPoints: 320 }
  });
  await prisma.customerAddress.upsert({
    where: { id: "demo-home-address" },
    update: {},
    create: {
      id: "demo-home-address",
      customerId: customer.id,
      type: "home",
      label: "Andheri (E)",
      line1: "Home - 17, Namam Premier, Marol",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400059",
      lat: 19.1197,
      lng: 72.8468
    }
  });

  const sellerUser = await prisma.user.upsert({
    where: { phone: "+919876544321" },
    update: {},
    create: { phone: "+919876544321", role: "SELLER", name: "Nirmala Devi" }
  });
  const seller = await prisma.sellerProfile.upsert({
    where: { id: "demo-seller" },
    update: {},
    create: {
      id: "demo-seller",
      userId: sellerUser.id,
      ownerName: "Nirmala Devi",
      shopName: "Nirmala's Kitchen",
      storeLive: true,
      selectedCategoryIds: ["vegetables", "dairy", "snacks", "packaged-food"],
      defaultSlaValue: 45,
      defaultSlaUnit: "minutes",
      autoInvoiceEnabled: true,
      deliveryFee: 29
    }
  });
  await prisma.sellerLocation.upsert({
    where: { id: "demo-seller-location" },
    update: {},
    create: {
      id: "demo-seller-location",
      sellerId: seller.id,
      label: "Kurla Store",
      address: "Kurla West, Mumbai",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400070",
      lat: 19.0726,
      lng: 72.8845,
      openTime: "09:00",
      closeTime: "21:00"
    }
  });

  for (const productId of ["mango-pickle", "milk", "tomato"]) {
    await prisma.sellerProduct.upsert({
      where: { id: `demo-offer-${productId}` },
      update: {},
      create: {
        id: `demo-offer-${productId}`,
        sellerId: seller.id,
        productId,
        price: productId === "mango-pickle" ? 149 : 68,
        qty: 20,
        active: true,
        tags: ["Quick Delivery"]
      }
    });
  }

  await prisma.platformSetting.upsert({
    where: { key: "paymentConfig" },
    update: {},
    create: {
      key: "paymentConfig",
      value: {
        vendors: [
          { id: "razorpay-upi", label: "UPI via Razorpay", enabled: true },
          { id: "razorpay-cards", label: "Cards via Razorpay", enabled: true },
          { id: "cod", label: "Cash on Delivery", enabled: true }
        ]
      }
    }
  });

  await prisma.platformSetting.upsert({
    where: { key: "rewardConfig" },
    update: {},
    create: { key: "rewardConfig", value: { enabled: true, pointsPerHundred: 1 } }
  });

  await prisma.notification.upsert({
    where: { id: "demo-notification-offer" },
    update: {},
    create: {
      id: "demo-notification-offer",
      audience: "customer",
      type: "offer",
      title: "Fresh local deals are live",
      body: "Order from nearby sellers and earn Bazaar Setu reward points today."
    }
  });

  await prisma.sellerLead.upsert({
    where: { id: "demo-seller-lead" },
    update: {},
    create: {
      id: "demo-seller-lead",
      customerId: customer.id,
      name: "Rahul Kumar",
      phone: "+919876543210",
      notes: "Customer is interested in onboarding a weekend fruit stall."
    }
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
