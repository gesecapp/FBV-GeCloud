import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useAppAuth = create<AppAuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      userId: null,
      cpf: null,
      userType: null,

      setAuth: (token: string, userId: string, cpf: string, userType: string) => {
        set({ isAuthenticated: true, token, userId, cpf, userType });
      },

      clearAuth: () => {
        set({ isAuthenticated: false, token: null, userId: null, cpf: null, userType: null });
      },
    }),
    {
      name: 'app-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        userId: state.userId,
        cpf: state.cpf,
        userType: state.userType,
      }),
    },
  ),
);

type AppAuthStore = {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  cpf: string | null;
  userType: string | null;
  setAuth: (token: string, userId: string, cpf: string, userType: string) => void;
  clearAuth: () => void;
};
