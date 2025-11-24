import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EmergencyFund, EmergencyFundTransaction } from "@flatflow/core";

interface EmergencyFundState {
  funds: EmergencyFund[];
  addContribution: (
    flatId: string,
    memberId: string,
    amount: number,
    description?: string
  ) => void;
  addWithdrawal: (
    flatId: string,
    memberId: string,
    amount: number,
    description?: string
  ) => void;
  getFundByFlatId: (flatId: string) => EmergencyFund | undefined;
  getTransactionsByFlatId: (flatId: string) => EmergencyFundTransaction[];
  resetFund: (flatId: string) => void;
  resetAllFunds: () => void;
}

const generateId = () => `fund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateTransactionId = () =>
  `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useEmergencyFundStore = create<EmergencyFundState>()(
  persist(
    (set, get) => ({
      funds: [],

      addContribution: (flatId, memberId, amount, description) => {
        const now = new Date().toISOString();
        const transaction: EmergencyFundTransaction = {
          id: generateTransactionId(),
          flatId,
          type: "CONTRIBUTION",
          memberId,
          amount,
          date: now,
          description,
          createdAt: now,
        };

        let fund = get().getFundByFlatId(flatId);
        if (!fund) {
          // Create new fund
          fund = {
            id: generateId(),
            flatId,
            balance: 0,
            transactions: [],
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({
            funds: [...state.funds, fund!],
          }));
        }

        // Add transaction and update balance
        const updatedFund: EmergencyFund = {
          ...fund,
          balance: fund.balance + amount,
          transactions: [...fund.transactions, transaction],
          updatedAt: now,
        };

        set((state) => ({
          funds: state.funds.map((f) => (f.id === fund!.id ? updatedFund : f)),
        }));
      },

      addWithdrawal: (flatId, memberId, amount, description) => {
        const fund = get().getFundByFlatId(flatId);
        if (!fund || fund.balance < amount) {
          throw new Error("Insufficient funds");
        }

        const now = new Date().toISOString();
        const transaction: EmergencyFundTransaction = {
          id: generateTransactionId(),
          flatId,
          type: "WITHDRAWAL",
          memberId,
          amount,
          date: now,
          description,
          createdAt: now,
        };

        const updatedFund: EmergencyFund = {
          ...fund,
          balance: fund.balance - amount,
          transactions: [...fund.transactions, transaction],
          updatedAt: now,
        };

        set((state) => ({
          funds: state.funds.map((f) => (f.id === fund.id ? updatedFund : f)),
        }));
      },

      getFundByFlatId: (flatId) => {
        return get().funds.find((fund) => fund.flatId === flatId);
      },

      getTransactionsByFlatId: (flatId) => {
        const fund = get().getFundByFlatId(flatId);
        if (!fund) return [];
        return fund.transactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },

      resetFund: (flatId) => {
        set((state) => ({
          funds: state.funds.filter((f) => f.flatId !== flatId),
        }));
      },

      resetAllFunds: () => {
        set({ funds: [] });
      },
    }),
    {
      name: "flatflow-emergency-fund-storage",
    }
  )
);

