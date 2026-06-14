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
- Master catalogue, categories, live seller offers, and product approval requests.
- Customer addresses with lat/lng, max 5 address rule, editable/deleteable addresses.
- Multi-seller parent order creation with seller sub-orders.
- Seller profile, store live toggle, SLA, delivery fee, auto-invoicing, products, order actions, and rejection reason/refund state.
- Admin dashboard, orders, sellers, product request queue, notifications, platform payment/reward settings, and seller leads.

## Demo IDs

Seed data creates stable records used by the first mobile screens:

- Customer: `demo-customer`
- Address: `demo-home-address`
- Seller: `demo-seller`
- Seller offers: `demo-offer-mango-pickle`, `demo-offer-milk`, `demo-offer-tomato`

## Production Gaps Before Launch

This is source scaffolding, not a live-ready production deployment. The API boundary has a first hardening pass; see `docs/PRODUCTION_READINESS.md` for the active launch checklist. Before public launch, Bazaar Setu still needs:

- Real OTP provider staging verification, session/device management UI, and admin bootstrap rotation.
- Google Maps Places/geocoding keys and address validation.
- Payment gateway onboarding, refunds, COD reconciliation, seller payout KYC, and settlement jobs.
- FSSAI/GST/legal metrology review and compliance document verification workflow.
- Catalogue import governance with licensed/admin-owned product images and HSN/GST review.
- Object storage for product/document uploads.
- Push notifications through FCM/APNs.
- Observability, audit logs, backups/PITR, production infrastructure hardening, dependency vulnerability resolution, and security testing.
