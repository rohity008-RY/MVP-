# Bazaar Setu Full-Stack Deployable MVP

This folder contains a deployable Bazaar Setu MVP with two separate mobile applications, one backend admin/support web console, and a Node.js backend API.

## Stack

- Backend: dependency-free Node.js HTTP server.
- Database: local JSON persistence at `backend/data/db.json`.
- Customer app: dependency-free mobile PWA served at `/customer`.
- Seller app: dependency-free mobile PWA served at `/seller`.
- Admin/Support console: dependency-free web console served at `/admin`.
- Deployment: Dockerfile, docker-compose, `.env.example`, health/readiness endpoints.

## Run

```bash
cd /Users/rohitvirendrayadav/bazaarsetu-mvp/fullstack
npm run start
```

Open:

```text
http://127.0.0.1:5010
```

App URLs:

```text
http://127.0.0.1:5010/customer
http://127.0.0.1:5010/seller
http://127.0.0.1:5010/admin
```

## Test

```bash
cd /Users/rohitvirendrayadav/bazaarsetu-mvp/fullstack
npm run smoke
```

## Deploy With Docker

```bash
cd /Users/rohitvirendrayadav/bazaarsetu-mvp/fullstack
cp .env.example .env
docker compose up --build -d
```

Production `.env` must set:

```text
NODE_ENV=production
HOST=0.0.0.0
PUBLIC_BASE_URL=https://your-domain.example
CORS_ORIGINS=https://your-domain.example
DEMO_AUTH_ENABLED=false
DEV_RESET_ENABLED=false
DATA_FILE=/data/db.json
```

## Go-Live Health

```text
/api/health
/api/ready
/api/openapi.json
```

`/api/ready` reports missing production integrations and launch blockers.

## Implemented Modules

- Customer: browse catalogue, search, cart, checkout, saved addresses, orders, notifications.
- Seller: profile, store live toggle, store timing, delivery fee, SLA, catalogue, inventory, order accept/reject notes, auto invoice, printable invoice/label, product request.
- Admin/Support: dashboard, order monitor, seller monitor, notification publishing, product approval/rejection, payment method toggles, reward settings, support role lockout for admin-only controls.
- Backend: catalogue, customer, seller, admin, notifications, settings, printable invoice/label HTML.
- PWA: separate manifests for customer, seller, and admin/support plus shared service worker.

## Demo Auth

The API includes demo OTP endpoints:

- `POST /api/auth/otp/start`
- `POST /api/auth/otp/verify`

For this MVP, role access is demo/static. Production should replace this with real OTP, token signing, RBAC, audit logs, and database-backed permissions.

## Frontend Structure

```text
apps/customer   Customer mobile application
apps/seller     Seller mobile application
apps/admin      Admin and support web console
apps/landing    Root app selector
apps/shared     Shared Bazaar Setu design system CSS
```

## Docs

- [Go-Live Checklist](docs/GO_LIVE_CHECKLIST.md)
- [API Reference](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)

## Important Production Note

This package is deployable. It is not yet a fully regulated public commerce platform until real OTP, payments, maps, push notifications, file storage, RBAC, audit logs, production database/backups, and legal/compliance review are completed.
