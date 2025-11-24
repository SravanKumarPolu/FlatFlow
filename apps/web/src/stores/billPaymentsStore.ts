import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BillPayment } from "@flatflow/core";

interface BillPaymentsState {
  payments: BillPayment[];
  addPayment: (payment: Omit<BillPayment, "id" | "createdAt">) => void;
  updatePayment: (id: string, updates: Partial<BillPayment>) => void;
  deletePayment: (id: string) => void;
  getPayment: (id: string) => BillPayment | undefined;
  getPaymentsByBillId: (billId: string) => BillPayment[];
  getPaymentsByFlatId: (flatId: string) => BillPayment[];
  getLatestPaymentForBill: (billId: string) => BillPayment | undefined;
  resetPayments: () => void;
}

const generateId = () => `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useBillPaymentsStore = create<BillPaymentsState>()(
  persist(
    (set, get) => ({
      payments: [],

      addPayment: (paymentData) => {
        const now = new Date().toISOString();
        const newPayment: BillPayment = {
          ...paymentData,
          id: generateId(),
          createdAt: now,
        };
        set((state) => ({
          payments: [...state.payments, newPayment],
        }));
      },

      updatePayment: (id, updates) => {
        set((state) => ({
          payments: state.payments.map((payment) =>
            payment.id === id ? { ...payment, ...updates } : payment
          ),
        }));
      },

      deletePayment: (id) => {
        set((state) => ({
          payments: state.payments.filter((payment) => payment.id !== id),
        }));
      },

      getPayment: (id) => {
        return get().payments.find((payment) => payment.id === id);
      },

      getPaymentsByBillId: (billId) => {
        return get()
          .payments.filter((payment) => payment.billId === billId)
          .sort((a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime());
      },

      getPaymentsByFlatId: (flatId) => {
        return get()
          .payments.filter((payment) => payment.flatId === flatId)
          .sort((a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime());
      },

      getLatestPaymentForBill: (billId) => {
        const payments = get().payments.filter((payment) => payment.billId === billId);
        if (payments.length === 0) return undefined;
        return payments.sort(
          (a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime()
        )[0];
      },

      resetPayments: () => {
        set({ payments: [] });
      },
    }),
    {
      name: "flatflow-bill-payments-storage",
    }
  )
);

