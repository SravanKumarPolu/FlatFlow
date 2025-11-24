import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Bill } from "@flatflow/core";

interface BillsState {
  bills: Bill[];
  addBill: (bill: Omit<Bill, "id" | "createdAt" | "updatedAt">) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  getBill: (id: string) => Bill | undefined;
  getActiveBills: () => Bill[];
  getBillsByFlatId: (flatId: string) => Bill[];
  resetBills: () => void;
}

const generateId = () => `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useBillsStore = create<BillsState>()(
  persist(
    (set, get) => ({
      bills: [],

      addBill: (billData) => {
        const now = new Date().toISOString();
        const newBill: Bill = {
          ...billData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          bills: [...state.bills, newBill],
        }));
      },

      updateBill: (id, updates) => {
        set((state) => ({
          bills: state.bills.map((bill) =>
            bill.id === id
              ? { ...bill, ...updates, updatedAt: new Date().toISOString() }
              : bill
          ),
        }));
      },

      deleteBill: (id) => {
        set((state) => ({
          bills: state.bills.filter((bill) => bill.id !== id),
        }));
      },

      getBill: (id) => {
        return get().bills.find((bill) => bill.id === id);
      },

      getActiveBills: () => {
        return get().bills.filter((bill) => bill.isActive);
      },

      getBillsByFlatId: (flatId) => {
        return get().bills.filter((bill) => bill.flatId === flatId);
      },

      resetBills: () => {
        set({ bills: [] });
      },
    }),
    {
      name: "flatflow-bills-storage",
    }
  )
);

