import { demoFallback } from "./demo-data";
import { useAuthStore } from "../store/auth";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://bazaar-setu-api-free.onrender.com";

export { API_BASE_URL };

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function refreshAccessToken() {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return false;
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });
  const json = await response.json();
  if (!json.ok) return false;
  useAuthStore.getState().setSession(json.data);
  return true;
}

export async function apiGet<T>(path: string): Promise<T> {
  try {
    let response = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders() });
    const json = await response.json();
    if (!json.ok) {
      if (json.error?.code === "AUTH_REQUIRED" && await refreshAccessToken()) {
        response = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders() });
        const refreshedJson = await response.json();
        if (refreshedJson.ok) return refreshedJson.data as T;
      }
      const fallback = demoFallback(path);
      if (json.error?.code === "AUTH_REQUIRED" && fallback) return fallback as T;
      throw new Error(json.error?.message ?? "API error");
    }
    return json.data as T;
  } catch (error) {
    const fallback = demoFallback(path);
    if (fallback) return fallback as T;
    throw error;
  }
}

export async function apiSend<T>(path: string, method: string, body: unknown): Promise<T> {
  try {
    let response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body)
    });
    const json = await response.json();
    if (!json.ok) {
      if (json.error?.code === "AUTH_REQUIRED" && await refreshAccessToken()) {
        response = await fetch(`${API_BASE_URL}${path}`, {
          method,
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(body)
        });
        const refreshedJson = await response.json();
        if (refreshedJson.ok) return refreshedJson.data as T;
      }
      if (json.error?.code === "AUTH_REQUIRED" && path.includes("/support-tickets")) {
        return { id: `demo-ticket-${Date.now()}`, ticketNumber: "BST-DEMO-NEW", status: "NEW", priority: "MEDIUM", messages: [], ...(body as object) } as T;
      }
      if (json.error?.code === "AUTH_REQUIRED") return { id: path.split("/").pop(), ...(body as object) } as T;
      throw new Error(json.error?.message ?? "API error");
    }
    return json.data as T;
  } catch (error) {
    if (path.includes("/support-tickets")) {
      return { id: `demo-ticket-${Date.now()}`, ticketNumber: "BST-DEMO-NEW", status: "NEW", priority: "MEDIUM", messages: [], ...(body as object) } as T;
    }
    return { id: path.split("/").pop(), ...(body as object) } as T;
  }
}

export async function logoutSession() {
  const { refreshToken, logout } = useAuthStore.getState();
  try {
    if (refreshToken) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ refreshToken })
      });
    }
  } finally {
    logout();
  }
}

export async function apiDocument(path: string) {
  let response = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders() });
  if (response.status === 401 && await refreshAccessToken()) {
    response = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders() });
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Could not generate document.");
  }
  const bytes = await response.arrayBuffer();
  return {
    contentType: response.headers.get("content-type") ?? "application/pdf",
    bytes: bytes.byteLength
  };
}
