# Bazaar Setu API

OpenAPI JSON is served at:

```text
/api/openapi.json
```

Core app routes:

```text
/customer
/seller
/admin
```

Health:

```text
GET /api/health
GET /api/ready
```

Catalogue:

```text
GET /api/catalogue/categories
GET /api/catalogue/products?q=&categoryId=
```

Customer:

```text
GET  /api/customer/home
GET  /api/customer/profile
GET  /api/customer/addresses
POST /api/customer/addresses
PUT  /api/customer/addresses/:addressId
DELETE /api/customer/addresses/:addressId
GET  /api/customer/orders
POST /api/customer/orders
```

Seller:

```text
GET   /api/seller/profile
PUT   /api/seller/profile
GET   /api/seller/catalogue
GET   /api/seller/products
POST  /api/seller/products
PATCH /api/seller/products/:sellerProductId
GET   /api/seller/orders
PATCH /api/seller/orders/:subOrderId
GET   /api/seller/orders/:subOrderId/print?type=invoice&format=A4
POST  /api/seller/product-requests
```

Admin/Support:

```text
GET   /api/admin/dashboard
GET   /api/admin/orders
GET   /api/admin/sellers
GET   /api/admin/product-requests
PATCH /api/admin/product-requests/:requestId
GET   /api/admin/settings
PUT   /api/admin/settings
GET   /api/admin/notifications
POST  /api/admin/notifications
```

Notifications:

```text
GET   /api/notifications?audience=customer
PATCH /api/notifications/read
```

Development-only:

```text
POST /api/dev/reset
```

`/api/dev/reset` only works when `DEV_RESET_ENABLED=true`.
