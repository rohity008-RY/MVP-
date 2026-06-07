# Bazaar Setu Architecture

## Surfaces

- Customer App: `/customer`
- Seller App: `/seller`
- Admin/Support Console: `/admin`
- API: `/api/*`

## Runtime

The current MVP is a dependency-free Node.js HTTP server. It serves all frontend assets and API routes from one process, making it easy to deploy to:

- VPS
- Docker host
- Render/Fly/Railway-style Node service
- Kubernetes container

## Data

Current MVP persistence is JSON:

```text
backend/data/db.json
```

For deployment, set:

```text
DATA_FILE=/data/db.json
```

and mount `/data` as a persistent volume.

For real production scale, migrate this data model to PostgreSQL:

- users
- customer_profiles
- seller_profiles
- compliance_documents
- categories
- product_master
- seller_products
- product_approval_requests
- parent_orders
- seller_sub_orders
- order_items
- payments
- invoices
- settlements
- notifications
- audit_logs

## Production Integrations

Recommended services:

- OTP: MSG91, Gupshup, Twilio, or Firebase Auth
- Payments: Razorpay, Cashfree, PhonePe, PayU
- Maps: Google Maps Platform
- Push: Firebase Cloud Messaging or OneSignal
- Object storage: S3-compatible bucket
- Database: PostgreSQL
- Cache/jobs: Redis

## Security Baseline

The deploy package includes:

- production env switches
- disabled dev reset in production
- disabled demo OTP in production
- security response headers
- request size limit
- Docker non-root user
- health/readiness endpoints

Still required before public launch:

- signed JWT/session auth
- RBAC middleware
- passwordless/OTP provider validation
- admin/support audit logs
- rate limits
- payment webhook signature verification
- encrypted secrets and backups
