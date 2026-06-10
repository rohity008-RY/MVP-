# Bazaar Setu Production Readiness

## Phase 1: API Boundary Hardening

Completed:

- Added request IDs on every API request and response.
- Added centralized API success/error response handling.
- Added structured validation errors and Prisma not-found handling.
- Added role guards for Admin/Support, Seller, and Customer APIs.
- Added customer and seller ownership guards for profile, address, product, and order routes.
- Added demo-auth mode for local prototype use, disabled by default in production.
- Added auth-route rate limiting.
- Added production startup blockers for missing database, weak JWT secret, demo auth, maps, OTP, and payment gateway config.
- Added transactional stock decrement during order creation to reduce oversell risk.
- Added rejection reason and manual invoice-number validation on seller order actions.
- Added workspace dependency lockfile and verified TypeScript across all workspaces.

## Required Production Environment

Set these before a production deploy:

- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET` with at least 32 random characters
- `DEMO_AUTH_ENABLED=false`
- `CORS_ORIGINS` with exact customer, seller, and admin origins
- `GOOGLE_MAPS_API_KEY`
- `OTP_PROVIDER_API_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## Still Not Launch Ready

These are not optional for public launch:

- Replace demo OTP with a real OTP provider and verified phone/session lifecycle.
- Add refresh tokens, logout/session revocation, and device/session management.
- Add real payment capture, refunds, COD reconciliation, seller KYC, and settlements.
- Add FSSAI/GST/legal metrology verification workflows with audit trails.
- Add file/object storage for product photos and compliance documents.
- Add production database migrations, backups, point-in-time recovery, and seed separation.
- Add Redis-backed rate limits, idempotency keys, and payment/order webhooks.
- Add structured logs, metrics, error monitoring, alerts, and audit logs.
- Resolve remaining framework dependency vulnerabilities with planned Expo/Next upgrades.
- Add automated API integration tests and mobile/admin E2E smoke tests.
