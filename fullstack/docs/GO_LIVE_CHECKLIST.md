# Bazaar Setu Go-Live Checklist

This repository is now packaged as a deployable MVP with:

- Customer mobile PWA at `/customer`
- Seller mobile PWA at `/seller`
- Admin/Support web console at `/admin`
- Backend API under `/api`
- Docker deploy files
- Persistent JSON data support through `DATA_FILE`

## Before Public Launch

These items must be completed before real users, payments, or personal data go live:

- Replace demo OTP with a real provider.
- Replace local JSON persistence with a production database, or mount `/data` with backups for a small pilot.
- Add real Google Maps geocoding/reverse-geocoding for customer and seller addresses.
- Add real payment gateway integration and settlement reconciliation.
- Add production RBAC/session auth for customer, seller, admin, and support users.
- Add object storage for uploaded product photos and compliance documents.
- Add legal pages: privacy policy, terms, refund policy, seller terms, grievance/contact details.
- Legal/compliance review for FSSAI, GST ECO, Consumer Protection, Legal Metrology, payments/KYC, and privacy.
- Add monitoring, logs, uptime alerts, and data backup alerts.

## Environment

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Important production flags:

```bash
NODE_ENV=production
HOST=0.0.0.0
DEMO_AUTH_ENABLED=false
DEV_RESET_ENABLED=false
DATA_FILE=/data/db.json
PUBLIC_BASE_URL=https://your-domain.example
CORS_ORIGINS=https://your-domain.example
```

## Docker Deploy

```bash
cd /Users/rohitvirendrayadav/bazaarsetu-mvp/fullstack
docker compose up --build -d
```

Open:

```text
https://your-domain.example/customer
https://your-domain.example/seller
https://your-domain.example/admin
```

## Verify

```bash
curl https://your-domain.example/api/health
curl https://your-domain.example/api/ready
curl https://your-domain.example/api/openapi.json
```

Readiness response should show:

```json
{
  "status": "ready",
  "blockers": []
}
```

If `blockers` is not empty, do not open public signup/order flow yet.

## Local Verification

```bash
npm run smoke
```

Expected:

```json
{ "status": "passed" }
```

## Pilot Launch Recommendation

Use this as a controlled city/locality pilot with:

- 5-20 verified sellers
- manually monitored admin/support console
- limited delivery zones
- manual payment settlement fallback
- daily JSON/database backups
- explicit operational SOPs for refunds, rejected prepaid orders, seller suspension, and catalogue approval

## Production Gaps To Close

The app is deployable, but not yet a regulated production commerce platform until these are integrated:

- Real authentication and authorization
- Real payment gateway
- Real maps/address verification
- Real notifications/push/SMS/WhatsApp
- Real product photo uploads
- Production database and backups
- Audit logs
- Compliance and legal review
