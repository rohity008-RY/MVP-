# Bazaar Setu App Platform

Production-source scaffold for Bazaar Setu with three separate products:

- `apps/customer-mobile`: Expo React Native customer app.
- `apps/seller-mobile`: Expo React Native seller app.
- `apps/admin-web`: Next.js admin/support/logistics web console.
- `services/api`: Express + Prisma API.
- `packages/shared-types`, `packages/config`, `packages/ui-tokens`: shared contracts, config, and brand tokens.

## Local Setup

```bash
cd /Users/rohitvirendrayadav/bazaarsetu-mvp/bazaar-setu-app
npm install
docker compose up -d
npm --workspace services/api run db:generate
npm --workspace services/api run db:migrate
npm --workspace services/api run db:seed
```

Run services in separate terminals:

```bash
npm run dev:api
npm run dev:admin
npm run dev:customer
npm run dev:seller
```

Validate the workspace:

```bash
npm run typecheck
npm test
npm run test:e2e
npm --workspace apps/admin-web run build
```

Build Android APKs for device testing:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME=$HOME/Library/Android/sdk
npm run build:apk:customer
npm run build:apk:seller
```

APK outputs:

- Customer: `apps/customer-mobile/android/app/build/outputs/apk/release/app-release.apk`
- Seller: `apps/seller-mobile/android/app/build/outputs/apk/release/app-release.apk`

For staging/production-style databases, use immutable migrations instead of development sync:

```bash
npm --workspace services/api run db:deploy
```

For the current free staging path, use Render + Neon + Upstash with mock OTP:

```bash
npm run secrets:free-staging
```

Then follow `docs/FREE_STAGING_DEPLOY.md`.

Default URLs:

- API: `http://127.0.0.1:5010`
- Admin web: `http://127.0.0.1:3000`
- Customer Expo: terminal QR / simulator
- Seller Expo: terminal QR / simulator

## Current Scope

The scaffold includes:

- OTP auth contract, access tokens, refresh sessions, logout, and secure staff provisioning.
- Customer/seller mobile secure session persistence through Expo SecureStore.
- Master catalogue, categories, backend-generated default product/category images, live seller offers, and product approval requests.
- Customer addresses with lat/lng, max 5 address rule, editable/deleteable addresses, and API-backed checkout selection.
- Admin-configured payment methods and rewards surfaced in customer checkout.
- Multi-seller parent order creation with seller sub-orders.
- Seller profile, store live toggle, SLA, delivery fee, auto-invoicing, products, order actions, and rejection reason/refund state.
- Seller invoice/label PDF document endpoints for A4, A5, 4x6, and 80mm printer formats.
- Admin dashboard, orders, sellers, product request queue, notifications, platform payment/reward settings, and seller leads.
- Dedicated Ops backend under `/api/ops` for SLA monitoring, refund queue actions, seller verification, store live control, catalogue approvals, and support timeline notes.
- Admin audit logs for sensitive Admin/Support/Ops mutations with an admin-only Settings view.

For the full start-to-end product walkthrough and feature list, see `docs/PRODUCT_FLOWS_AND_FEATURES.md`.

## Demo IDs

Seed data creates stable records used by the first mobile screens and staging smoke tests:

- Customer: `demo-customer`
- Address: `demo-home-address`
- Sellers: `demo-seller-fresh`, `demo-seller-meat`, `demo-seller-home`, `demo-seller-campus`
- Demo admin login phone: `+919000000001`
- Demo support login phone: `+919000000002`
- OTP mode on free staging is `mock`; `/api/auth/otp/start` returns `demoOtp`.
- Demo data includes 23 categories, 60+ catalogue products, live inventory, multi-seller orders, invoice-required and bag-packed lanes, refund queue, document review queue, catalogue approval requests, notifications, rewards, payment vendors, and seller leads.

Staging deploys run this seed automatically after migrations when `DEPLOYMENT_ENV=staging`.

## Production Gaps Before Launch

This is source scaffolding, not a live-ready production deployment. The API boundary has a first hardening pass; see `docs/PRODUCTION_READINESS.md` for the active launch checklist. Before public launch, Bazaar Setu still needs:

- Real OTP provider staging verification, session/device management UI, and admin bootstrap rotation.
- Google Maps Places/geocoding keys and address validation.
- Payment gateway onboarding, refunds, COD reconciliation, seller payout KYC, and settlement jobs.
- FSSAI/GST/legal metrology review and compliance document verification workflow.
- Catalogue import governance with licensed/admin-owned real product images and HSN/GST review.
- Object storage for product/document uploads.
- Push notifications through FCM/APNs.
- Observability, backups/PITR, production infrastructure hardening, dependency vulnerability resolution, and security testing.
