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

## Phase 2: OTP, Sessions, Redis Limits, Admin Provisioning

Completed:

- Added database-backed OTP challenges with hashed OTP storage, expiry, max attempts, and consumed state.
- Added configurable OTP delivery adapter via `OTP_PROVIDER_URL` and `OTP_PROVIDER_API_KEY`.
- Added short-lived access tokens plus refresh-token sessions stored as hashes.
- Added refresh-token rotation, current-session logout, and all-device logout.
- Added session validation in API auth middleware so revoked/expired sessions no longer authorize protected routes.
- Added Redis-backed rate limits using `REDIS_URL`, with in-memory fallback only outside production.
- Added secure first-admin bootstrap using `ADMIN_BOOTSTRAP_TOKEN`.
- Added authenticated admin-only staff provisioning for Admin and Support users.
- Blocked public self-signup as Admin or Support; those roles must be provisioned first.

## Required Production Environment

Set these before a production deploy:

- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET` with at least 32 random characters
- `DEMO_AUTH_ENABLED=false`
- `CORS_ORIGINS` with exact customer, seller, and admin origins
- `GOOGLE_MAPS_API_KEY`
- `REDIS_URL`
- `OTP_PROVIDER_URL`
- `OTP_PROVIDER_API_KEY`
- `OTP_CODE_PEPPER` with at least 32 random characters
- `ADMIN_BOOTSTRAP_TOKEN` with at least 32 random characters for initial admin bootstrap
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## Still Not Launch Ready

These are not optional for public launch:

- Connect and test the real OTP vendor payload/response format in staging.
- Add device/session management UI for users and staff.
- Add real payment capture, refunds, COD reconciliation, seller KYC, and settlements.
- Add FSSAI/GST/legal metrology verification workflows with audit trails.
- Add file/object storage for product photos and compliance documents.
- Add production database migrations, backups, point-in-time recovery, and seed separation.
- Add idempotency keys and payment/order webhooks.
- Add structured logs, metrics, error monitoring, alerts, and audit logs.
- Track remaining moderate framework advisories from Next's pinned `postcss` and Expo's `xcode`/`uuid` tooling chain until upstream patched releases are available; do not use npm's current downgrade recommendations.
- Add mobile/admin E2E smoke tests.

## Phase 3: Framework Refresh And Auth Tests

Completed:

- Upgraded Customer and Seller mobile apps to Expo 56, Expo Router 56, React 19, React Native 0.86, and compatible native packages.
- Upgraded Admin web to Next 16 and React 19.
- Added API integration tests for OTP start/verify, refresh-token rotation, logout, admin bootstrap, admin staff provisioning, unprovisioned admin blocking, and rate limiting.
- Added `npm --workspace services/api test` using Vitest and Supertest.

Known residual:

- `npm audit --omit=dev` still reports moderate advisories for Next's internally pinned `postcss@8.4.31` and Expo's `xcode -> uuid@7.0.3` path. The suggested npm force-fixes downgrade Next/Expo to old majors, so they are intentionally not applied.
