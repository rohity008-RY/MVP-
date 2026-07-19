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
- Added configurable OTP delivery adapter via `OTP_DELIVERY_MODE`, `OTP_PROVIDER_URL`, and `OTP_PROVIDER_API_KEY`.
- Added short-lived access tokens plus refresh-token sessions stored as hashes.
- Added refresh-token rotation, current-session logout, and all-device logout.
- Added session validation in API auth middleware so revoked/expired sessions no longer authorize protected routes.
- Added Redis-backed rate limits using `REDIS_URL`, with in-memory fallback only outside production.
- Added secure first-admin bootstrap using `ADMIN_BOOTSTRAP_TOKEN`.
- Added authenticated admin-only staff provisioning for Admin and Support users.
- Blocked public self-signup as Admin or Support; those roles must be provisioned first.
- Added dependency-aware `/api/ready` checks for Postgres and Redis/Upstash.
- Added stricter production environment blockers for exact CORS origins and API base URL.
- Added OTP provider timeout handling.
- Added graceful shutdown with Prisma/Redis disconnects.
- Hardened the API Docker runtime by installing OpenSSL for Prisma and running as a non-root user.

## Required Production Environment

Set these before a production deploy:

- `NODE_ENV=production`
- `DEPLOYMENT_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET` with at least 32 random characters
- `DEMO_AUTH_ENABLED=false`
- `CORS_ORIGINS` with exact customer, seller, and admin origins
- `MAPS_PROVIDER=google`
- `GOOGLE_MAPS_API_KEY`
- `REDIS_URL` or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- `OTP_DELIVERY_MODE=provider`
- `OTP_PROVIDER_URL`
- `OTP_PROVIDER_API_KEY`
- `OTP_PROVIDER_TIMEOUT_MS`
- `OTP_CODE_PEPPER` with at least 32 random characters
- `ADMIN_BOOTSTRAP_TOKEN` with at least 32 random characters for initial admin bootstrap
- `PAYMENTS_PROVIDER=razorpay`
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
- Add rollback rehearsal, backup restore drill, and migration runbook sign-off.
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

## Phase 4: Database Migrations, CI, Staging, E2E

Completed:

- Added a baseline Prisma migration for the marketplace schema before the auth-session migration.
- Added `db:deploy` for production/staging migration rollout.
- Added GitHub Actions CI with Postgres 16 and Redis 7 service containers.
- Added API E2E tests that use real Postgres and Redis for OTP login, refresh rotation, logout, admin bootstrap, staff provisioning, unprovisioned staff blocking, and Redis rate limiting.
- Added staging environment template, API Dockerfile, staging compose file, and staging deployment checklist.

Known residual:

- Staging still needs real cloud infrastructure/secrets, backup/PITR policy, and a restore drill before launch.
- The API container is staging-oriented and intentionally simple; production deployment should use a hardened image, secret manager, managed Postgres/Redis, health checks, and observability sidecars or agents.

## Phase 5: Staging Deploy Wiring

Completed:

- Verified the first GitHub CI run for `58a389f` completed successfully.
- Added Admin web Dockerfile and Cloud Run-compatible start script.
- Added manual `Staging Deploy` GitHub Actions workflow for Google Cloud Run.
- Added Cloud Run migration job execution before API deploy.
- Added staging smoke script for API health/readiness and Admin availability.
- Documented required GitHub environment secrets, variables, Google Secret Manager names, and deploy service account permissions.
- Added low-cost staging support for Cloud Run + Neon Postgres + Upstash Redis + Google Maps restricted key + mock/test OTP.
- Added deploy guard that refuses Fynd/GoFynd/shared company GCP project IDs.
- Added free-first staging mode for Render + Neon + Upstash with `OTP_DELIVERY_MODE=mock`, `MAPS_PROVIDER=browser`, and `PAYMENTS_PROVIDER=mock`.
- Added Upstash Redis REST support for free staging rate limits.

Known residual:

- A Google Cloud account is not logged in locally, so real Cloud Run resources were not created from this machine.
- A dedicated non-Fynd Bazaar Setu Google Cloud project, GitHub `staging` environment values, and Google Cloud Secret Manager entries must be created before running the deploy workflow.
- Free Render/Neon/Upstash staging can be used before paid cloud resources, but it has cold starts and free-tier limits.

## Phase 6: Core Marketplace Correctness

Completed:

- Added checkout validation against Admin-enabled payment methods.
- Added checkout reward calculation with an auditable `RewardLedger` table and customer balance increment.
- Added a strict seller order transition state machine for confirm, reject, manual invoice, handover, and delivery.
- Blocked invalid seller lane jumps, including delivery before handover and handover before invoice.
- Added parent order status/payment rollup after seller order actions and Ops refund actions.
- Unified Admin and Ops product approval/rejection through shared catalogue approval services.
- Added focused API unit tests for payment validation, reward calculation, seller order transitions, prepaid rejection refund routing, and parent rollups.

Known residual:

- Online payment methods still create staging/mock pending orders; real provider order creation, capture, webhooks, and refund reconciliation remain required before launch.
- Role-wise Admin/Support permissions are still coarse and need a formal permission matrix.
- Reward reversal rules for cancelled/refunded orders still need finance/product policy.
