import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Flat } from "@flatflow/core";

interface FlatState {
  currentFlat: Flat | null;
  setCurrentFlat: (flat: Flat) => void;
  updateCurrentFlat: (updates: Partial<Flat>) => void;
  createFlat: (flatData: Omit<Flat, "id" | "createdAt" | "updatedAt">) => void;
  resetFlat: () => void;
}

const generateId = () => `flat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useFlatStore = create<FlatState>()(
  persist(
    (set, get) => ({
      currentFlat: null,

      setCurrentFlat: (flat) => {
        set({ currentFlat: flat });
      },

      updateCurrentFlat: (updates) => {
        const current = get().currentFlat;
        if (!current) return;

        set({
          currentFlat: {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      createFlat: (flatData) => {
        const now = new Date().toISOString();
        const newFlat: Flat = {
          ...flatData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set({ currentFlat: newFlat });
      },

      resetFlat: () => {
        set({ currentFlat: null });
      },
    }),
    {
      name: "flatflow-flat-storage",
    }
  )
);

