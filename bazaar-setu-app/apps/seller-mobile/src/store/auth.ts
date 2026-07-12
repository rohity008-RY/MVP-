import { create } from "zustand";

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
  setSession: (session: {
    accessToken: string;
    refreshToken: string;
    user?: UserProfile;
    sellerProfile?: SellerProfile | null;
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  setSession: (session) =>
    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
      sellerProfile: session.sellerProfile,
      sellerId: session.sellerProfile?.id
    }),
  logout: () => set({ accessToken: undefined, refreshToken: undefined, sellerId: undefined, user: undefined, sellerProfile: undefined })
}));
