import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ImpulseCategory = "SWIGGY" | "OLA_UBER" | "FOOD" | "TRAVEL";

export interface SpendingLimit {
  category: ImpulseCategory;
  weeklyLimit: number;
  monthlyLimit: number;
  enabled: boolean;
}

interface ImpulseControlState {
  limits: SpendingLimit[];
  setLimit: (category: ImpulseCategory, weeklyLimit: number, monthlyLimit: number, enabled: boolean) => void;
  getLimit: (category: ImpulseCategory) => SpendingLimit | undefined;
  resetLimits: () => void;
}

const defaultLimits: SpendingLimit[] = [
  { category: "SWIGGY", weeklyLimit: 2000, monthlyLimit: 8000, enabled: true },
  { category: "OLA_UBER", weeklyLimit: 1500, monthlyLimit: 6000, enabled: true },
  { category: "FOOD", weeklyLimit: 3000, monthlyLimit: 12000, enabled: false },
  { category: "TRAVEL", weeklyLimit: 2000, monthlyLimit: 8000, enabled: false },
];

export const useImpulseControlStore = create<ImpulseControlState>()(
  persist(
    (set, get) => ({
      limits: defaultLimits,

      setLimit: (category, weeklyLimit, monthlyLimit, enabled) => {
        set((state) => {
          const existing = state.limits.find((l) => l.category === category);
          if (existing) {
            return {
              limits: state.limits.map((l) =>
                l.category === category
                  ? { category, weeklyLimit, monthlyLimit, enabled }
                  : l
              ),
            };
          } else {
            return {
              limits: [...state.limits, { category, weeklyLimit, monthlyLimit, enabled }],
            };
          }
        });
      },

      getLimit: (category) => {
        return get().limits.find((l) => l.category === category);
      },

      resetLimits: () => {
        set({ limits: defaultLimits });
      },
    }),
    {
      name: "flatflow-impulse-control-storage",
    }
  )
);

