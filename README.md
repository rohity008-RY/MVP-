# Bazaar Setu Static Customer + Seller + Ops App

This is a dependency-free static prototype for Bazaar Setu with three modes:

- Customer App: splash, home, search/explore, cart, checkout, orders, profile, saved addresses, payments, rewards, and Become-a-Seller lead.
- Seller App: language selection, tier selection, signup, dashboard, AI assistant, orders, catalogue/products, inventory, add-new-product request, profile, and analytics.
- Ops Admin: desktop operations panel for dashboard, orders, sellers, verification, catalogue approvals, seller leads, payment/rewards config, refunds, payouts, compliance, and delivery batching.

The app uses only `index.html`, `styles.css`, and `app.js`. Fonts and Tabler Icons load from CDN; if offline, the screens still render with system fonts and text fallbacks.

## Run locally

```bash
cd /Users/rohitvirendrayadav/bazaarsetu-mvp
python3 -m http.server 8789 --bind 127.0.0.1
```

Open [http://127.0.0.1:8789/index.html](http://127.0.0.1:8789/index.html).

## Smoke test

Open [http://127.0.0.1:8789/self-test.html](http://127.0.0.1:8789/self-test.html) after starting the server. It loads the app in an iframe and checks the main customer, seller, ops, and role access interactions.

## Full-stack mobile app + backend

A runnable mobile-first app and backend API now live in [fullstack](/Users/rohitvirendrayadav/bazaarsetu-mvp/fullstack).

```bash
cd /Users/rohitvirendrayadav/bazaarsetu-mvp/fullstack
npm run start
```

Open [http://127.0.0.1:5010](http://127.0.0.1:5010).

## Implemented public functions

- `showCustomerScreen(screenId)`
- `showSellerScreen(screenId)`
- `addToCart(productId)`
- `updateCartQty(productId, delta)`
- `acceptSellerOrder(orderId)`
- `markSellerOrderPacked(orderId)`
- `updateSellerStock(productId, delta)`
- `sendSellerAiMessage(text)`
- `showOpsView(viewId)`
- `selectOpsRole(role)`
- `selectSellerCategory(categoryId)`
- `addSellerProduct(productId)`
- `updateSellerProduct(productId, fields)`
- `submitProductRequest(payload)`
- `approveProductRequest(requestId)`
- `rejectProductRequest(requestId, reason)`
- `openPrintOptions(orderId, type)`
- `saveCustomerAddress(payload)`
- `editCustomerAddress(addressId, payload)`
- `removeCustomerAddress(addressId)`
- `markCustomerNotificationsRead()`
- `submitSellerLead()`
- `updateRewardConfig(config)`
- `togglePaymentMethod(methodId)`
- `publishAdminNotification(payload)`
- `saveSellerProfileMock()`
- `toggleSellerStoreLive()`
- `toggleSellerAutoInvoice()`

## Scope notes

- No backend, payment gateway, maps API, real AI API, or OTP is included in this version.
- Ops/Admin role access is prototype RBAC only. Roles include `admin`, `ops`, `support`, and `logistics`.
- Customer and seller changes are stored in browser memory plus `localStorage`.
- Product, seller, order, inventory, rewards, payment, print, and AI data are sample-only for visual and interaction prototyping.
- The master catalogue is curated prototype data with local placeholder imagery, broad ecommerce categories, and optional HSN fields. It is not a scraped or licensed production catalogue.
