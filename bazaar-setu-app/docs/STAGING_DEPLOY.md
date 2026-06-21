# Bazaar Setu Staging Deploy

This is the staging path for a production-shaped rehearsal before public launch.

For the current free/no-card-first path, use `docs/FREE_STAGING_DEPLOY.md` instead. This Cloud Run guide is the later production-shaped staging path.

## Required Services

- Google Cloud Run in a dedicated Bazaar Setu Google Cloud project
- Neon Postgres for staging database
- Upstash Redis for rate limits, using either TCP `REDIS_URL` or REST URL/token
- Mock/test OTP mode for staging login
- Google Maps staging/restricted key
- Razorpay test-mode keys
- Object storage bucket for uploads
- Dedicated Bazaar Setu Google Cloud project with Cloud Run, Artifact Registry, Secret Manager, and IAM Workload Identity Federation enabled.

Do not use Fynd, GoFynd, or any shared/company projects for Bazaar Setu staging. Staging should live in a separate project owned for this product, for example `bazaar-setu-staging`.

## GitHub Staging Environment

Create a GitHub environment named `staging`, then add these secrets:

- `GCP_PROJECT_ID`: Google Cloud project ID.
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: Workload Identity Provider resource name.
- `GCP_SERVICE_ACCOUNT`: deploy service account email.

Add these GitHub environment variables:

- `GCP_REGION`: recommended `asia-south1`.
- `GCP_ARTIFACT_REPOSITORY`: recommended `bazaar-setu`.
- `STAGING_API_SERVICE`: recommended `bazaar-setu-api-staging`.
- `STAGING_ADMIN_SERVICE`: recommended `bazaar-setu-admin-staging`.
- `STAGING_MIGRATION_JOB`: recommended `bazaar-setu-api-migrate-staging`.
- `STAGING_API_URL`: final Cloud Run API URL or staging API custom domain.
- `STAGING_ADMIN_URL`: final Cloud Run Admin URL or staging Admin custom domain.
- `STAGING_CORS_ORIGINS`: comma-separated staging customer, seller, and admin origins.
- `STAGING_OTP_DELIVERY_MODE`: use `mock` for free staging; use `provider` when a real SMS provider is configured.
- `STAGING_CLOUDSQL_INSTANCE`: leave empty for Neon. Set only if using Cloud SQL later.
- `STAGING_VPC_CONNECTOR`: leave empty for public Neon/Upstash. Set only if private networking is added later.

Store runtime secrets in Google Secret Manager with these exact names:

- `bazaar-setu-staging-database-url`
- `bazaar-setu-staging-redis-url` or equivalent Upstash REST URL/token secrets
- `bazaar-setu-staging-jwt-secret`
- `bazaar-setu-staging-otp-code-pepper`
- `bazaar-setu-staging-admin-bootstrap-token`
- `bazaar-setu-staging-google-maps-api-key`
- `bazaar-setu-staging-razorpay-key-id`
- `bazaar-setu-staging-razorpay-key-secret`

Only create these OTP provider secrets when `STAGING_OTP_DELIVERY_MODE=provider`:

- `bazaar-setu-staging-otp-provider-url`
- `bazaar-setu-staging-otp-provider-api-key`

## Low-Cost Staging Stack

Use this for the first Bazaar Setu staging environment:

1. Create a dedicated Google Cloud project owned for Bazaar Setu, for example `bazaar-setu-staging`. Do not use Fynd, GoFynd, or any shared company project.
2. Enable Cloud Run, Artifact Registry, Secret Manager, Cloud Build, IAM Credentials, and Workload Identity Federation in that project.
3. Create a Neon Postgres project/database for staging. Store its SSL connection string in Secret Manager as `bazaar-setu-staging-database-url`.
4. Create an Upstash Redis database for staging. Store its `rediss://...` URL in Secret Manager as `bazaar-setu-staging-redis-url`.
5. Create a Google Maps Platform key with only the APIs Bazaar Setu needs enabled. Store it as `bazaar-setu-staging-google-maps-api-key`.
6. Use mock OTP first: set `STAGING_OTP_DELIVERY_MODE=mock`. The API returns `demoOtp` from `/api/auth/otp/start` only for this staging/test delivery mode.
7. Add Razorpay test-mode keys or temporary staging placeholders before starting the API, because production-mode readiness checks require payment keys.
8. Add the GitHub `staging` environment secrets and variables listed above.

The deploy service account needs:

- Artifact Registry Writer
- Cloud Run Admin
- Service Account User on the Cloud Run runtime service account
- Secret Manager Secret Accessor for the staging secrets
- Logs Writer

## GitHub Actions Deploy

Use the manual workflow:

```text
Actions -> Staging Deploy -> Run workflow
```

The workflow:

1. Authenticates to Google Cloud through Workload Identity Federation.
2. Builds and pushes API and Admin Docker images.
3. Deploys and executes the Prisma migration Cloud Run Job.
4. Deploys API and Admin Cloud Run services.
5. Runs `scripts/staging-smoke.mjs` against `STAGING_API_URL` and `STAGING_ADMIN_URL`.

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

## Local Status

The first CI run for commit `58a389f` passed on GitHub Actions. The staging workflow is ready, but it cannot run until the GitHub `staging` environment and Google Cloud secrets/identity are configured.
