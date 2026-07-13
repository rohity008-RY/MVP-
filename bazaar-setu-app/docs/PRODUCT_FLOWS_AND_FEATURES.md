# Bazaar Setu Product Flows And Feature List

This document describes the start-to-end Bazaar Setu product journey for Customer, Seller, and Ops/Admin users. It is written for demo review, QA, product planning, and production-readiness tracking.

## Product Surfaces

- Customer app: mobile-first app for browsing, cart, checkout, orders, rewards, support, and seller lead submission.
- Seller app: mobile-first seller workspace for onboarding, catalogue, inventory, order processing, SLA, invoice/label, analytics, and profile.
- Ops/Admin web: backend command centre for support, logistics, catalogue governance, seller verification, refunds, notifications, rewards, and platform settings.
- API/backend: protected Express/Prisma backend with Postgres, Redis rate limits, OTP/session auth, catalogue, order, seller, customer, admin, and ops modules.

## Customer Start-To-End Flow

1. Open app
   - Customer sees Bazaar Setu branded home.
   - App loads dynamic categories and live products from active sellers.
   - Demo fallback data is available for app review when the API is unavailable or the user is not logged in.

2. Language and location
   - Customer selects preferred language.
   - Customer adds delivery address with lat/lng.
   - Customer can save up to 5 addresses as Home, Office, or Other.
   - Address can be edited or removed later.

3. Browse and search
   - Customer browses broad ecommerce categories.
   - Search supports product/category/alias intent.
   - Voice search is planned for production app UX.
   - Product cards show name, unit, seller price, and compliance fields such as HSN when available.

4. Product selection
   - Customer adds items to cart.
   - Cart supports products from one seller or multiple sellers.
   - Cart quantity can be increased/decreased.
   - Stock and live seller availability are checked by backend at checkout.

5. Checkout
   - Customer selects saved address.
   - Customer selects enabled payment method from admin configuration.
   - Payment options can include UPI, cards, wallet, COD, and future payment vendors.
   - Backend creates one parent order and separate seller sub-orders for each seller.
   - Delivery fee is calculated seller-wise.

6. Order tracking
   - Customer sees parent order and seller-wise shipment/sub-order status.
   - Seller SLA and timeline are visible to customer.
   - Status flow: Placed, Confirmed, Invoice Required if needed, Bag Packed, Handed Over, Delivered.
   - Rejected/cancelled prepaid items move to refund pending/refunded flow.

7. Rewards and notifications
   - Customer earns reward points based on admin-configured rules.
   - Admin-published customer notifications appear for offers, order alerts, and system messages.

8. Support and reorder
   - Customer can view order history.
   - Customer can raise order, refund, payment, address, seller, or delivery issues from Help Center.
   - Customer support tickets can be linked to a parent order and seller sub-order.
   - Support replies appear in the ticket history and can be sent as customer notifications.
   - Reorder can be built from previous order items.

9. Become a seller
   - Customer submits seller-interest lead.
   - Lead appears in Ops/Admin for callback and onboarding.

## Customer Feature List

- Mobile-first quick-commerce home
- Dynamic category/product listing
- Search-ready product catalogue
- Multi-seller cart support
- Cart quantity controls
- Checkout with seller-wise delivery fee
- Saved addresses with lat/lng
- Up to 5 editable/removable addresses
- Payment methods controlled by admin
- Rewards display and earning rules
- Order history and seller-wise timeline
- Help Center with order-linked support ticket creation
- Customer-visible support replies and ticket status
- Notifications published by admin
- Become-a-seller lead submission
- Support/refund visibility
- Multi-language structure planned across labels and product names

## Seller Start-To-End Flow

1. Download and open seller app
   - Seller chooses language.
   - Seller starts self-serve onboarding.

2. Seller onboarding
   - Seller enters owner name, shop name, mobile, optional email, address, geo-location, store category, and timings.
   - Seller selects categories they sell.
   - Selected categories control which catalogue products are shown to the seller.
   - Seller adds bank/payment details and delivery fee.
   - Seller uploads required documents such as FSSAI, GSTIN, PAN, bank proof, address proof, and legal metrology where applicable.

3. Store settings
   - Seller sets store open/close timing.
   - Seller sets delivery SLA in minutes, hours, or days.
   - Seller enables/disables store live state.
   - Seller enables/disables auto invoicing.
   - Seller creates tags such as Quick Delivery, Standard Delivery, or custom tags.

4. Catalogue and inventory
   - Seller sees master catalogue products from selected categories.
   - Seller selects product and adds price/quantity to make it live.
   - Seller edits only seller-controlled fields: price, quantity, active/inactive, tags, SLA override.
   - Product master keeps platform-owned fields: HSN, GST, legal metrology, FSSAI applicability, image, unit, label/invoice name.
   - Every seeded product/category has a backend-generated default Bazaar Setu image, so sellers can go live even before real product photography is uploaded.

5. Add new product request
   - Seller uploads/captures product photo.
   - Seller enters name, category, unit, optional HSN, and mandatory details.
   - AI extraction can suggest basic product fields in future production flow.
   - Request goes to Ops/Admin approval queue.
   - If approved, product enters master catalogue and seller receives notification.
   - If rejected, seller sees rejection reason.

6. Order processing
   - Seller sees OMS lanes: New, Invoice Required, Bag Packed, Ready To Handover, Delivered/Closed, Action Centre.
   - Seller can confirm or reject new orders.
   - Rejection requires reason note.
   - If prepaid order is rejected, refund state moves to Refund Pending.
   - If auto invoice is enabled, confirming generates invoice number and moves shipment to Bag Packed.
   - If auto invoice is disabled, order moves to Invoice Required until seller enters invoice number manually.

7. Packing, invoice, and label
   - After invoice exists, seller can print/download invoice and label.
   - Required formats: A4, A5, 4x6, 80mm thermal.
   - Invoice/label include Bazaar Setu branding, seller, customer, order/shipment ID, invoice number/date, item details, HSN, GST placeholders, quantity/UQC, price, MRP/net quantity/origin/expiry where relevant, FSSAI details, and support info.

8. Handover and delivery
   - Seller marks packed/ready.
   - Seller hands over to delivery partner or customer.
   - Timeline captures every event for SLA/customer visibility.

9. Analytics and reports
   - Seller can view order count, revenue, SLA health, cancellation/rejection reasons, low-stock items, category sales, and COD/prepaid mix.
   - Downloadable detailed reports are planned for production.

10. Seller support and escalation
   - Seller can raise Ops support tickets for order blockers, delivery pickup, invoice/label print issues, payouts, catalogue, and documents.
   - Seller tickets can be linked to the affected sub-order.
   - Ops replies appear in seller ticket history and can be sent as seller notifications.
   - Prepaid order rejection automatically creates an Ops refund-review ticket so refunds do not depend on manual discovery.

## Seller Feature List

- OTP/session login
- Language selection
- Self-serve onboarding
- Category selection
- Multi-location profile
- Store timings
- Store live/disable toggle
- Delivery SLA in min/hour/day
- Delivery fee setting
- Auto invoice setting
- Bank/payment details
- Compliance document upload/status
- Products, My Products, Inventory, Add New Product tabs
- Master catalogue search and selection
- Inventory price/qty update
- Active/inactive product control
- Custom tags
- New product approval request
- OMS order lanes
- Confirm/reject with rejection reason
- Auto/manual invoice flow
- Printable invoice and label formats
- SLA timeline events
- Analytics and reports
- Seller Help flow with Ops escalation
- Order-linked support tickets for pickup, print, payout, catalogue, and documents

## Ops/Admin Start-To-End Flow

1. Staff provisioning and login
   - Admin/support user is provisioned securely.
   - Staff logs in with OTP.
   - Backend protects admin/ops routes by role.
   - Current staging keeps backend protected, provides OTP login for Admin/Support, and shows demo preview data before login.

2. Dashboard
   - Ops sees total orders, today orders, revenue, live sellers, disabled sellers, active sub-orders, breached SLA, due-soon SLA, pending refunds, product requests, pending docs, and seller leads.

3. SLA monitor
   - Ops monitors seller sub-orders by SLA due time.
   - Breached and due-soon orders are highlighted.
   - Ops can add support notes/tags to sub-order timeline.

4. Order monitoring
   - Ops sees parent orders and seller sub-orders.
   - Multi-seller parent orders show each seller shipment separately.
   - Ops can identify payment state, invoice state, seller, customer, address, and item list.

5. Refund desk
   - Ops sees rejected/cancelled prepaid sub-orders.
   - Ops can mark refund pending or refunded.
   - Refund amount and note are captured in timeline.

6. Seller verification
   - Ops reviews seller profile, locations, store live state, documents, selected categories, products, SLA, and payment setup.
   - Ops can approve/reject documents.
   - Rejection requires reason.
   - Ops can enable/disable seller live state and send seller notification.

7. Catalogue governance
   - Ops reviews seller new-product requests.
   - Ops can approve product into master catalogue or reject with reason.
   - Approved product becomes available in catalogue.
   - Seller gets notification after approval/rejection.

8. Notifications
   - Admin publishes customer, seller, admin, or all-audience messages.
   - Notification types include offer, order, system, approval, and refund.

9. Platform controls
   - Admin configures payment vendors/methods shown in checkout.
   - Admin configures rewards earning rule.
   - Admin tracks become-a-seller leads.

10. Reports and compliance
   - Ops/Admin should export order, refund, inventory, seller, compliance, settlement, and SLA reports.
   - Production needs audit logs, role-specific permissions, and compliance-ready exports.

11. Support desk and escalation monitoring
   - Ops/Admin sees customer, seller, and system-created tickets in one Support Desk.
   - Ticket statuses include New, Assigned, Waiting Customer, Waiting Seller, Waiting Delivery, Refund Review, Resolved, and Reopened.
   - Ticket priority drives support SLA: Critical 1 hour, High 2 hours, Medium 6 hours, Low 24 hours.
   - Ops can add internal notes, reply to customers, reply to sellers, change status/priority, and monitor breached support SLAs.
   - Refund-review tickets are created automatically for prepaid seller rejection flows.

## Ops/Admin Feature List

- Admin/support RBAC
- Secure staff provisioning
- Protected ops backend routes
- Ops dashboard metrics
- SLA monitor
- Order/sub-order monitoring
- Refund queue and refund status updates
- Seller verification queue
- Document approval/rejection with reason
- Seller live/disable control
- Catalogue approval/rejection with reason
- Seller lead queue
- Notification publishing
- Payment vendor settings
- Reward configuration
- Support notes on order timeline
- Support Desk with ticket assignment/status/priority/SLA
- Customer and seller visible support replies
- Internal support notes hidden from external users
- Automatic refund-review support ticket on prepaid rejection
- Compliance reporting planned
- Downloadable operational reports planned

## Current Staging Demo Coverage

- 23 categories
- 60+ master products
- 4 sellers
- 3 customers
- Live inventory
- Multi-seller parent orders
- Order states: Placed, Invoice Required, Bag Packed, Handed Over, Delivered, Rejected, Refunded
- Pending refund queue
- Pending/rejected document queue
- Pending/rejected catalogue request queue
- Seller leads
- Notifications
- Payment/reward settings
- Protected `/api/ops/*` backend
- Admin web OTP login with protected backend actions
- Customer Help Center and seller Help escalation screens
- Ops/Admin Support Desk with four seeded demo tickets
- System-created refund-review support ticket flow
- Customer and seller APK demo fallback data
- Secure mobile session persistence with refresh/logout
- API-backed customer address and payment selection in checkout
- Seller invoice/label PDF generation in A4, A5, 4x6, and 80mm formats
- Admin-only audit log review for sensitive mutations

## Next Production Priorities

1. Add real Google Maps address capture and geocoding.
2. Add payment gateway integration, refund webhooks, COD reconciliation, and seller settlements.
3. Add production notification delivery through FCM/APNs and WhatsApp/SMS providers.
4. Add file/object storage for product photos, support attachments, and compliance documents.
5. Add support assignment queues, escalation timers, canned replies, call/WhatsApp logging, and satisfaction rating.
6. Add biometric/PIN unlock and device/session management for mobile apps.
7. Add downloadable reports and audit-log exports.
8. Add CI/CD deployment gates for Prisma migrations, API tests, E2E tests, mobile builds, and staging smoke tests.
9. Complete legal/FSSAI/GST/legal metrology/privacy/payment reviews before production launch.
