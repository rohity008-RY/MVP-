# Bazaar Setu Staging Deploy

This is the staging path for a production-shaped rehearsal before public launch.

## Required Services

- Postgres 16
- Redis 7
- OTP provider staging account
- Google Maps staging/restricted key
- Razorpay test-mode keys
- Object storage bucket for uploads

## First-Time Setup

1. Copy `.env.staging.example` to `.env.staging`.
2. Replace every placeholder secret with a staging secret from the password manager.
3. Point `CORS_ORIGINS` to the real staging customer, seller, and admin URLs.
4. Run migrations before the API is opened to testers:

```bash
npm ci --legacy-peer-deps
npm --workspace services/api run db:generate
npm --workspace services/api run db:deploy
```

5. Bootstrap the first Admin user once:

```bash
curl -X POST "$API_BASE_URL/api/auth/admin/bootstrap" \
  -H "content-type: application/json" \
  -H "x-admin-bootstrap-token: $ADMIN_BOOTSTRAP_TOKEN" \
  -d '{"phone":"+91XXXXXXXXXX","name":"Ops Admin","email":"ops@example.com"}'
```

6. Rotate or remove `ADMIN_BOOTSTRAP_TOKEN` after the first Admin is created.

## Compose Rehearsal

For a self-contained staging rehearsal on one server:

```bash
cp .env.staging.example .env.staging
docker compose -f docker-compose.staging.yml up --build
```

The compose file starts API, Postgres, and Redis. For managed cloud staging, remove the Postgres/Redis services and point `DATABASE_URL` / `REDIS_URL` to managed instances.

## Release Gate

Run these before promoting a build:

```bash
npm run typecheck
npm test
npm run test:e2e
npm --workspace apps/admin-web run build
```

The E2E suite expects a migrated Postgres database and reachable Redis instance through `DATABASE_URL` and `REDIS_URL`.
