import { demoFallback } from "./demo-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5010";

function authFallback(path: string) {
  return demoFallback(path);
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
