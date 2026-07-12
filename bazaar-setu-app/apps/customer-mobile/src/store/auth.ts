import { create } from "zustand";

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
  setSession: (session: {
    accessToken: string;
    refreshToken: string;
    user?: UserProfile;
    customerProfile?: CustomerProfile | null;
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  setSession: (session) =>
    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
      customerId: session.customerProfile?.id
    }),
  logout: () => set({ accessToken: undefined, refreshToken: undefined, user: undefined, customerId: undefined })
}));
