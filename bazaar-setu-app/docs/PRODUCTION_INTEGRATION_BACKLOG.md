# Bazaar Setu Production Integration Backlog

This tracks the remaining external integrations and hardening work needed before a real customer/seller launch. The current code supports the flows and protected APIs, but these items require vendor accounts, credentials, legal review, or paid infrastructure.

## Identity And Sessions

- Persist mobile access/refresh tokens in secure device storage.
- Add refresh-on-app-open and explicit logout revocation in mobile apps.
- Add admin staff provisioning UI with maker/checker approval for support users.
- Add audit logs for every Admin/Support mutation.

## Maps And Address Capture

- Create a restricted Google Maps Platform key for mobile/web.
- Use Places Autocomplete for customer and seller addresses.
- Store lat/lng, formatted address, pincode, locality, and delivery geofence.
- Add delivery distance validation and fee calculation by zone.

## Payments, Refunds, COD, And Settlements

- Integrate Razorpay or Cashfree for UPI/cards/netbanking/wallet.
- Add payment order creation, webhook verification, payment capture, and failed payment recovery.
- Add refund creation and webhook reconciliation.
- Add COD remittance workflow and seller settlement ledger.
- Add payout bank validation and penny-drop where provider supports it.

## Notifications

- Add FCM/APNs push notification credentials.
- Add SMS/WhatsApp provider for OTP and operational alerts.
- Add notification preference centre by customer/seller.
- Add notification delivery log and retry queue.

## Catalogue And Media

- Replace placeholder product images with licensed/admin-owned assets.
- Add object storage for seller uploaded product photos and compliance documents.
- Run legal/ToS review before any external catalogue import.
- Add HSN/GST/legal-metrology review workflow for packaged goods.

## Compliance

- Confirm FSSAI registration/license requirements for every food seller and platform role.
- Confirm GST ECO rules for registered and unregistered sellers before go-live.
- Add Consumer Protection marketplace disclosures, grievance officer details, return/refund terms, and seller identifiers.
- Add privacy notice, consent capture, data export/delete workflows, and retention policy.

## Reliability And Operations

- Move staging/production to separate databases and Redis instances.
- Add CI with typecheck, API integration tests, E2E tests, Prisma migration checks, and Docker image build.
- Add backup/restore drills for Postgres.
- Add uptime checks, error alerts, structured logs, metrics, and slow query monitoring.
- Add role-wise permission matrix for Admin, Support, Logistics, Finance, and Catalogue Ops.
