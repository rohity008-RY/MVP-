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
   - Support flow routes issues to Ops/Admin.
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
- Customer and seller APK demo fallback data

## Next Production Priorities

1. Replace in-memory mobile sessions with secure device storage and biometric/PIN unlock.
2. Add real Google Maps address capture and geocoding.
3. Add payment gateway integration, refund webhooks, COD reconciliation, and seller settlements.
4. Add production notification delivery through FCM/APNs and WhatsApp/SMS providers.
5. Add file/object storage for product photos, invoices, labels, and documents.
6. Add printer-ready invoice/label rendering.
7. Add push notifications through FCM/APNs.
8. Add audit logs for every admin/seller action.
9. Add downloadable reports.
10. Complete legal/FSSAI/GST/legal metrology/privacy/payment reviews before production launch.
