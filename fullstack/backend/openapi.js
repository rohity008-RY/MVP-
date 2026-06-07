function openApiSpec(config) {
  return {
    openapi: "3.0.3",
    info: {
      title: "Bazaar Setu API",
      version: "0.1.0",
      description: "Deployable MVP API for Customer, Seller, and Admin/Support applications."
    },
    servers: [{ url: config.publicBaseUrl }],
    tags: [
      { name: "Health" },
      { name: "Auth" },
      { name: "Catalogue" },
      { name: "Customer" },
      { name: "Seller" },
      { name: "Admin" },
      { name: "Notifications" }
    ],
    paths: {
      "/api/health": { get: { tags: ["Health"], summary: "Runtime health check" } },
      "/api/ready": { get: { tags: ["Health"], summary: "Go-live readiness status" } },
      "/api/auth/otp/start": { post: { tags: ["Auth"], summary: "Start OTP login. Demo OTP is only available when DEMO_AUTH_ENABLED=true." } },
      "/api/auth/otp/verify": { post: { tags: ["Auth"], summary: "Verify OTP and return demo role token." } },
      "/api/catalogue/categories": { get: { tags: ["Catalogue"], summary: "List master categories" } },
      "/api/catalogue/products": { get: { tags: ["Catalogue"], summary: "Search/list products by query or categoryId" } },
      "/api/customer/home": { get: { tags: ["Customer"], summary: "Customer home payload" } },
      "/api/customer/profile": { get: { tags: ["Customer"], summary: "Customer profile" } },
      "/api/customer/addresses": {
        get: { tags: ["Customer"], summary: "List customer addresses" },
        post: { tags: ["Customer"], summary: "Create customer address" }
      },
      "/api/customer/addresses/{addressId}": {
        put: { tags: ["Customer"], summary: "Update customer address" },
        delete: { tags: ["Customer"], summary: "Delete customer address" }
      },
      "/api/customer/orders": {
        get: { tags: ["Customer"], summary: "List customer orders" },
        post: { tags: ["Customer"], summary: "Create parent order and seller sub-orders" }
      },
      "/api/seller/profile": {
        get: { tags: ["Seller"], summary: "Seller profile" },
        put: { tags: ["Seller"], summary: "Update seller profile, SLA, documents, and store settings" }
      },
      "/api/seller/catalogue": { get: { tags: ["Seller"], summary: "Seller category-filtered catalogue" } },
      "/api/seller/products": {
        get: { tags: ["Seller"], summary: "Seller live products" },
        post: { tags: ["Seller"], summary: "Add catalogue product to seller inventory" }
      },
      "/api/seller/products/{sellerProductId}": { patch: { tags: ["Seller"], summary: "Update seller product price, stock, active state, tags, or SLA" } },
      "/api/seller/orders": { get: { tags: ["Seller"], summary: "Seller order lanes" } },
      "/api/seller/orders/{subOrderId}": { patch: { tags: ["Seller"], summary: "Confirm, reject, invoice, handover, or deliver seller sub-order" } },
      "/api/seller/orders/{subOrderId}/print": { get: { tags: ["Seller"], summary: "Printable invoice or label HTML" } },
      "/api/seller/product-requests": { post: { tags: ["Seller"], summary: "Submit new product request for Admin approval" } },
      "/api/admin/dashboard": { get: { tags: ["Admin"], summary: "Admin dashboard metrics" } },
      "/api/admin/orders": { get: { tags: ["Admin"], summary: "Admin order monitor" } },
      "/api/admin/sellers": { get: { tags: ["Admin"], summary: "Seller monitor" } },
      "/api/admin/product-requests": { get: { tags: ["Admin"], summary: "Product approval queue" } },
      "/api/admin/product-requests/{requestId}": { patch: { tags: ["Admin"], summary: "Approve or reject product request" } },
      "/api/admin/settings": {
        get: { tags: ["Admin"], summary: "Payment and rewards settings" },
        put: { tags: ["Admin"], summary: "Update payment and rewards settings" }
      },
      "/api/admin/notifications": {
        get: { tags: ["Admin"], summary: "Notification log" },
        post: { tags: ["Admin"], summary: "Publish notification" }
      },
      "/api/notifications": { get: { tags: ["Notifications"], summary: "Audience notifications" } },
      "/api/notifications/read": { patch: { tags: ["Notifications"], summary: "Mark notifications read" } }
    }
  };
}

module.exports = { openApiSpec };
