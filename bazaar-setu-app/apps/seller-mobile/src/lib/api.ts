import { demoFallback } from "./demo-data";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5010";

export async function apiGet<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);
    const json = await response.json();
    if (!json.ok) {
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
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const json = await response.json();
    if (!json.ok) {
      if (json.error?.code === "AUTH_REQUIRED") return { id: path.split("/").pop(), ...(body as object) } as T;
      throw new Error(json.error?.message ?? "API error");
    }
    return json.data as T;
  } catch (error) {
    return { id: path.split("/").pop(), ...(body as object) } as T;
  }
}
