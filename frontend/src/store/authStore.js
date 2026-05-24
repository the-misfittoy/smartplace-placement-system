import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,
      _hasHydrated:    false, // <-- SSR/Async Hydration Flag

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        window.location.replace("/login"); // Single source of truth for redirect
      },

      isStudent: () => get().user?.role === "student",
      isTPO:     () => get().user?.role === "tpo",
      isHR:      () => get().user?.role === "company",
      studentId: () => get().user?.student_id ?? null,
      companyId: () => get().user?.company_id ?? null,
    }),
    {
      name:    "smartplace-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user:  state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Automatically trigger when localStorage is fully read into memory
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;