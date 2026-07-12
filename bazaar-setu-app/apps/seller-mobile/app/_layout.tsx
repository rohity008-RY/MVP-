import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useMemo } from "react";
import { useAuthStore } from "../src/store/auth";

export default function Layout() {
  const client = useMemo(() => new QueryClient(), []);
  useEffect(() => {
    void useAuthStore.getState().hydrateSession();
  }, []);
  return (
    <QueryClientProvider client={client}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
