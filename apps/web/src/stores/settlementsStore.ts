import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Settlement } from "@flatflow/core";

interface SettlementsState {
  settlements: Settlement[];
  addSettlement: (settlement: Omit<Settlement, "id" | "createdAt">) => void;
  updateSettlement: (id: string, updates: Partial<Settlement>) => void;
  deleteSettlement: (id: string) => void;
  getSettlement: (id: string) => Settlement | undefined;
  getSettlementsByFlatId: (flatId: string) => Settlement[];
  getSettlementsByMember: (memberId: string) => Settlement[];
  resetSettlements: () => void;
}

const generateId = () => `settlement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useSettlementsStore = create<SettlementsState>()(
  persist(
    (set, get) => ({
      settlements: [],

      addSettlement: (settlementData) => {
        const now = new Date().toISOString();
        const newSettlement: Settlement = {
          ...settlementData,
          id: generateId(),
          createdAt: now,
        };
        set((state) => ({
          settlements: [...state.settlements, newSettlement],
        }));
      },

      updateSettlement: (id, updates) => {
        set((state) => ({
          settlements: state.settlements.map((settlement) =>
            settlement.id === id ? { ...settlement, ...updates } : settlement
          ),
        }));
      },

      deleteSettlement: (id) => {
        set((state) => ({
          settlements: state.settlements.filter(
            (settlement) => settlement.id !== id
          ),
        }));
      },

      getSettlement: (id) => {
        return get().settlements.find((settlement) => settlement.id === id);
      },

      getSettlementsByFlatId: (flatId) => {
        return get().settlements.filter(
          (settlement) => settlement.flatId === flatId
        );
      },

      getSettlementsByMember: (memberId) => {
        return get().settlements.filter(
          (settlement) =>
            settlement.fromMemberId === memberId ||
            settlement.toMemberId === memberId
        );
      },

      resetSettlements: () => {
        set({ settlements: [] });
      },
    }),
    {
      name: "flatflow-settlements-storage",
    }
  )
);

