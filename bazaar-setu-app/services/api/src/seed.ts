import { prisma } from "./db.js";

const categories = [
  ["fruits", "Fruits", "apple"],
  ["vegetables", "Vegetables", "leaf"],
  ["dairy", "Dairy & Eggs", "milk"],
  ["meat-seafood", "Meat & Seafood", "meat"],
  ["bakery", "Bakery", "bread"],
  ["snacks", "Snacks", "snack"],
  ["beverages", "Beverages", "drink"],
  ["staples", "Staples", "rice"],
  ["pulses", "Pulses & Dal", "dal"],
  ["spices", "Masala & Spices", "spice"],
  ["packaged-food", "Packaged Food", "jar"],
  ["home-care", "Home Care", "clean"],
  ["personal-care", "Personal Care", "care"],
  ["baby-care", "Baby Care", "baby"],
  ["pet-care", "Pet Care", "pet"],
  ["pooja", "Pooja Items", "diya"]
];

const products = [
  ["tomato", "Tomato Hybrid", "vegetables", "1 kg", "0702", 34],
  ["potato", "Potato Agra", "vegetables", "1 kg", "0701", 31],
  ["onion", "Onion Nashik", "vegetables", "1 kg", "0703", 42],
  ["apple", "Apple Shimla", "fruits", "1 kg", "0808", 180],
  ["banana", "Banana Robusta", "fruits", "1 dozen", "0803", 62],
  ["milk", "Full Cream Milk", "dairy", "1 litre", "0401", 68],
  ["paneer", "Paneer Fresh", "dairy", "200 g", "0406", 92],
  ["chicken-curry-cut", "Chicken Curry Cut", "meat-seafood", "500 g", "0207", 190],
  ["bread", "Multigrain Bread", "bakery", "400 g loaf", "1905", 55],
  ["chips", "Classic Salted Chips", "snacks", "52 g", "2005", 20],
  ["cola", "Cola Bottle", "beverages", "750 ml", "2202", 40],
  ["rice", "Basmati Rice", "staples", "1 kg", "1006", 145],
  ["toor-dal", "Toor Dal", "pulses", "1 kg", "0713", 168],
  ["turmeric", "Turmeric Powder", "spices", "100 g", "0910", 44],
  ["mango-pickle", "Homemade Mango Pickle", "packaged-food", "250 g jar", "2106", 149],
  ["detergent", "Detergent Powder", "home-care", "1 kg", "3402", 112],
  ["soap", "Bath Soap", "personal-care", "4 x 75 g", "3401", 96],
  ["agarbatti", "Agarbatti Sandal", "pooja", "100 sticks", "3307", 65]
];

async function main() {
  for (const [id, name, icon] of categories) {
    await prisma.category.upsert({ where: { id }, update: {}, create: { id, name, icon } });
  }

  for (const [id, name, categoryId, unit, hsn, mrp] of products) {
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
