# Development Plan

## Phase 1: Foundation

- Keep API, customer mobile, seller mobile, and admin web as separate apps in one monorepo.
- Stabilize Prisma schema and add migrations for users, sellers, customers, catalogue, orders, settings, notifications, and leads.
- Replace demo IDs with real auth profile lookup once OTP integration is connected.
- Add typed API client packages shared by mobile and web.

## Phase 2: Customer App

- Build Zepto/Blinkit-style home, search, category, cart, checkout, orders, notifications, rewards, and profile flows.
- Integrate Google Maps address capture with saved Home/Office/Other addresses.
- Add payment methods from admin config and order-level rewards.
- Add voice search, multilingual strings, and push notification handling.

## Phase 3: Seller App

- Build self-serve onboarding with category selection, documents, locations, bank/payment setup, store timings, delivery SLA, and live toggle.
- Build catalogue browse, add-to-my-products, inventory/price edit, and new-product approval request.
- Build OMS lanes: New, Invoice Required, Bag Packed, Ready To Handover, Delivered/Closed, Action Centre.
- Add printable invoice/label templates in A4, A5, 4x6, and 80mm thermal.

## Phase 4: Admin / Support / Logistics

- Add RBAC roles for Admin, Support, and Logistics.
- Add seller verification, product approval, notifications, rewards, payment config, refund handling, and seller lead queues.
- Add operational dashboards for SLA, rejection reasons, refunds, delivery jobs, and seller health.
- Add downloadable reports for orders, settlement, GST/FSSAI compliance, inventory, and low-stock.

## Phase 5: Launch Readiness

- Add production deployment, database backups, monitoring, audit logging, CI/CD, and rollback.
- Run legal/compliance review for food, GST, legal metrology, privacy, payments, and ecommerce marketplace obligations.
- Run QA on Android, iOS, mobile web, desktop admin, printer layouts, low-bandwidth flows, and multilingual content.
