import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  currentMemberId: string | null;
  setCurrentMemberId: (memberId: string) => void;
  clearCurrentMemberId: () => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentMemberId: null,

      setCurrentMemberId: (memberId) => {
        set({ currentMemberId: memberId });
      },

      clearCurrentMemberId: () => {
        set({ currentMemberId: null });
      },

      resetUser: () => {
        set({ currentMemberId: null });
      },
    }),
    {
      name: "flatflow-user-storage",
    }
  )
);

