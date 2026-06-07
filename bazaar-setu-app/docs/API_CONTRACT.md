# API Contract Snapshot

Base URL: `http://127.0.0.1:5010`

## Health

- `GET /api/health`
- `GET /api/readiness`

## Auth

- `POST /api/auth/otp/start`
- `POST /api/auth/otp/verify`

## Catalogue

- `GET /api/catalogue/categories`
- `GET /api/catalogue/products?q=&categoryId=`

## Customer

- `GET /api/customer/home`
- `GET /api/customer/:customerId/addresses`
- `POST /api/customer/:customerId/addresses`
- `PUT /api/customer/:customerId/addresses/:addressId`
- `DELETE /api/customer/:customerId/addresses/:addressId`
- `POST /api/customer/:customerId/seller-leads`
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
- `POST /api/seller/:sellerId/product-requests`

## Admin

- `GET /api/admin/dashboard`
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
