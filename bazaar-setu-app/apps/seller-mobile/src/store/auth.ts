import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const SESSION_KEY = "bazaar_setu_seller_session";

type SellerProfile = {
  id: string;
  shopName?: string | null;
  ownerName?: string | null;
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
  sellerId?: string;
  user?: UserProfile;
  sellerProfile?: SellerProfile | null;
  hydrated: boolean;
  hydrateSession: () => Promise<void>;
  setSession: (session: {
    accessToken: string;
    refreshToken: string;
    user?: UserProfile;
    sellerProfile?: SellerProfile | null;
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
        sellerProfile?: SellerProfile | null;
        sellerId?: string;
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
      sellerProfile: session.sellerProfile,
      sellerId: session.sellerProfile?.id
    };
    void SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(next));
    set({
      ...next,
      hydrated: true
    });
  },
  logout: () => {
    void SecureStore.deleteItemAsync(SESSION_KEY);
    set({ accessToken: undefined, refreshToken: undefined, sellerId: undefined, user: undefined, sellerProfile: undefined, hydrated: true });
  }
}));
