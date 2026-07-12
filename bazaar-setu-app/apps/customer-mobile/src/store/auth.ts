import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const SESSION_KEY = "bazaar_setu_customer_session";

type CustomerProfile = {
  id: string;
};

type UserProfile = {
  id: string;
  name?: string | null;
  phone: string;
  email?: string | null;
};

interface AuthState {
  accessToken?: string;
  refreshToken?: string;
  customerId?: string;
  user?: UserProfile;
  hydrated: boolean;
  hydrateSession: () => Promise<void>;
  setSession: (session: {
    accessToken: string;
    refreshToken: string;
    user?: UserProfile;
    customerProfile?: CustomerProfile | null;
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  hydrateSession: async () => {
    try {
      const saved = await SecureStore.getItemAsync(SESSION_KEY);
      if (!saved) {
        set({ hydrated: true });
        return;
      }
      const session = JSON.parse(saved) as {
        accessToken?: string;
        refreshToken?: string;
        user?: UserProfile;
        customerId?: string;
      };
      set({ ...session, hydrated: true });
    } catch {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      set({ hydrated: true });
    }
  },
  setSession: (session) => {
    const next = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
      customerId: session.customerProfile?.id
    };
    void SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(next));
    set({
      ...next,
      hydrated: true
    });
  },
  logout: () => {
    void SecureStore.deleteItemAsync(SESSION_KEY);
    set({ accessToken: undefined, refreshToken: undefined, user: undefined, customerId: undefined, hydrated: true });
  }
}));
