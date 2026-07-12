const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5010";

function authFallback(path: string) {
  if (path === "/api/ops/dashboard") {
    return {
      totalOrders: 0,
      todayOrders: 0,
      todayRevenue: 0,
      liveSellers: 0,
      disabledSellers: 0,
      pendingProductRequests: 0,
      pendingDocuments: 0,
      activeSubOrders: 0,
      breachedSla: 0,
      dueSoonSla: 0,
      pendingRefunds: 0,
      sellerLeads: 0,
      statusCounts: {},
      paymentCounts: {}
    };
  }
  if (path === "/api/admin/settings") {
    return {
      paymentConfig: {
        vendors: [
          { id: "razorpay-upi", label: "UPI via Razorpay", enabled: false },
          { id: "razorpay-cards", label: "Cards via Razorpay", enabled: false },
          { id: "cod", label: "Cash on Delivery", enabled: false }
        ]
      },
      rewardConfig: { enabled: false, pointsPerHundred: 0 }
    };
  }
  if (
    path.startsWith("/api/admin/") ||
    path.startsWith("/api/ops/")
  ) {
    return [];
  }
  return undefined;
}

function errorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message);
  }
  return "API error";
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  const json = await response.json();
  if (!json.ok) {
    const code = json.error?.code;
    if (response.status === 401 && code === "AUTH_REQUIRED") {
      return authFallback(path) as T;
    }
    throw new Error(errorMessage(json.error));
  }
  return json.data as T;
}

export async function apiSend<T>(path: string, method: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await response.json();
  if (!json.ok) throw new Error(errorMessage(json.error));
  return json.data as T;
}
