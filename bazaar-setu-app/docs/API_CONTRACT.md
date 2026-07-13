# API Contract Snapshot

Base URL: `http://127.0.0.1:5010`

## Health

- `GET /api/health`
- `GET /api/readiness`

## Auth

- `POST /api/auth/otp/start`
- `POST /api/auth/otp/verify`
- `GET /api/auth/me`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/admin/bootstrap`

## Catalogue

- `GET /api/catalogue/categories`
- `GET /api/catalogue/products?q=&categoryId=`

## Customer

- `GET /api/customer/config`
- `GET /api/customer/home`
- `GET /api/customer/:customerId/addresses`
- `POST /api/customer/:customerId/addresses`
- `PUT /api/customer/:customerId/addresses/:addressId`
- `DELETE /api/customer/:customerId/addresses/:addressId`
- `POST /api/customer/:customerId/seller-leads`
- `GET /api/customer/:customerId/support-tickets?status=&limit=`
- `POST /api/customer/:customerId/support-tickets`
- `POST /api/customer/:customerId/support-tickets/:ticketId/messages`
- `GET /api/customer/:customerId/orders`
- `POST /api/customer/:customerId/orders`

## Seller

- `GET /api/seller/:sellerId/profile`
- `PUT /api/seller/:sellerId/profile`
- `GET /api/seller/:sellerId/catalogue`
- `GET /api/seller/:sellerId/products`
- `POST /api/seller/:sellerId/products`
- `PATCH /api/seller/:sellerId/products/:sellerProductId`
- `GET /api/seller/:sellerId/orders`
- `PATCH /api/seller/:sellerId/orders/:subOrderId`
- `GET /api/seller/:sellerId/orders/:subOrderId/document?type=invoice|label&format=a4|a5|4x6|80mm`
- `POST /api/seller/:sellerId/product-requests`
- `GET /api/seller/:sellerId/support-tickets?status=&limit=`
- `POST /api/seller/:sellerId/support-tickets`
- `POST /api/seller/:sellerId/support-tickets/:ticketId/messages`

## Admin

- `GET /api/admin/dashboard`
- `POST /api/admin/staff-users`
- `PATCH /api/admin/staff-users/:staffUserId`
- `GET /api/admin/orders`
- `GET /api/admin/sellers`
- `GET /api/admin/seller-leads`
- `PATCH /api/admin/seller-leads/:leadId`
- `GET /api/admin/product-requests`
- `PATCH /api/admin/product-requests/:requestId`
- `GET /api/admin/notifications`
- `POST /api/admin/notifications`
- `GET /api/admin/settings`
- `PATCH /api/admin/settings`
- `GET /api/admin/audit-logs?action=&entityType=&limit=`

## Ops

- `GET /api/ops/dashboard`
- `GET /api/ops/orders?status=&paymentState=&sellerId=&sla=&q=&limit=`
- `GET /api/ops/sla`
- `PATCH /api/ops/sub-orders/:subOrderId/note`
- `GET /api/ops/refunds`
- `PATCH /api/ops/refunds/:subOrderId`
- `GET /api/ops/support-tickets?status=&priority=&assignedToUserId=&q=&limit=`
- `PATCH /api/ops/support-tickets/:ticketId`
- `POST /api/ops/support-tickets/:ticketId/messages`
- `GET /api/ops/seller-verification`
- `PATCH /api/ops/documents/:documentId`
- `PATCH /api/ops/sellers/:sellerId/live`
- `GET /api/ops/catalogue-requests`
- `PATCH /api/ops/catalogue-requests/:requestId`

## Support Ticket Notes

- Customer and seller ticket messages are filtered by audience. Internal Ops notes are never returned to customer/seller app ticket APIs.
- Rejected prepaid seller orders automatically create a system support ticket in `REFUND_REVIEW` when refund follow-up is required.
- Support priority sets a response SLA: critical 1 hour, high 2 hours, medium 6 hours, low 24 hours.
