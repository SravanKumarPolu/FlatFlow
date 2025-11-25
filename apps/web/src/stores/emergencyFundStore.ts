import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EmergencyFund, EmergencyFundTransaction } from "@flatflow/core";

interface EmergencyFundState {
  funds: EmergencyFund[];
  addContribution: (
    flatId: string,
    memberId: string,
    amount: number,
    description?: string,
    date?: string
  ) => void;
  addWithdrawal: (
    flatId: string,
    memberId: string,
    amount: number,
    description?: string,
    date?: string
  ) => void;
  updateFundName: (flatId: string, name?: string) => void;
  deleteTransaction: (flatId: string, transactionId: string) => void;
  recalculateBalance: (flatId: string) => void;
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

      addContribution: (flatId, memberId, amount, description, date) => {
        const now = new Date().toISOString();
        const transactionDate = date || now;
        const transaction: EmergencyFundTransaction = {
          id: generateTransactionId(),
          flatId,
          type: "CONTRIBUTION",
          memberId,
          amount,
          date: transactionDate,
          description,
          createdAt: now,
        };

        let fund = get().getFundByFlatId(flatId);
        if (!fund) {
          // Create new fund
          fund = {
            id: generateId(),
            flatId,
            name: undefined,
            balance: 0, // Will be recalculated
            transactions: [],
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({
            funds: [...state.funds, fund!],
          }));
        }

        // Add transaction and recalculate balance from all transactions
        const allTransactions = [...fund.transactions, transaction];
        const newBalance = allTransactions.reduce((sum, t) => {
          return t.type === "CONTRIBUTION" ? sum + t.amount : sum - t.amount;
        }, 0);

        const updatedFund: EmergencyFund = {
          ...fund,
          balance: newBalance, // Derived from transactions
          transactions: allTransactions,
          updatedAt: now,
        };

        set((state) => ({
          funds: state.funds.map((f) => (f.id === fund!.id ? updatedFund : f)),
        }));
      },

      addWithdrawal: (flatId, memberId, amount, description, date) => {
        const fund = get().getFundByFlatId(flatId);
        if (!fund) {
          throw new Error("Emergency fund not found");
        }

        // Calculate current balance from transactions
        const currentBalance = fund.transactions.reduce((sum, t) => {
          return t.type === "CONTRIBUTION" ? sum + t.amount : sum - t.amount;
        }, 0);

        if (currentBalance < amount) {
          throw new Error("Insufficient funds");
        }

        const now = new Date().toISOString();
        const transactionDate = date || now;
        const transaction: EmergencyFundTransaction = {
          id: generateTransactionId(),
          flatId,
          type: "WITHDRAWAL",
          memberId,
          amount,
          date: transactionDate,
          description,
          createdAt: now,
        };

        // Recalculate balance from all transactions
        const allTransactions = [...fund.transactions, transaction];
        const newBalance = allTransactions.reduce((sum, t) => {
          return t.type === "CONTRIBUTION" ? sum + t.amount : sum - t.amount;
        }, 0);

        const updatedFund: EmergencyFund = {
          ...fund,
          balance: newBalance, // Derived from transactions
          transactions: allTransactions,
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

      updateFundName: (flatId, name) => {
        const fund = get().getFundByFlatId(flatId);
        if (!fund) return;

        const updatedFund: EmergencyFund = {
          ...fund,
          name,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          funds: state.funds.map((f) => (f.id === fund.id ? updatedFund : f)),
        }));
      },

      deleteTransaction: (flatId, transactionId) => {
        const fund = get().getFundByFlatId(flatId);
        if (!fund) return;

        const remainingTransactions = fund.transactions.filter(
          (t) => t.id !== transactionId
        );

        // Recalculate balance from remaining transactions
        const newBalance = remainingTransactions.reduce((sum, t) => {
          return t.type === "CONTRIBUTION" ? sum + t.amount : sum - t.amount;
        }, 0);

        const updatedFund: EmergencyFund = {
          ...fund,
          balance: newBalance,
          transactions: remainingTransactions,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          funds: state.funds.map((f) => (f.id === fund.id ? updatedFund : f)),
        }));
      },

      recalculateBalance: (flatId) => {
        const fund = get().getFundByFlatId(flatId);
        if (!fund) return;

        const newBalance = fund.transactions.reduce((sum, t) => {
          return t.type === "CONTRIBUTION" ? sum + t.amount : sum - t.amount;
        }, 0);

        const updatedFund: EmergencyFund = {
          ...fund,
          balance: newBalance,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          funds: state.funds.map((f) => (f.id === fund.id ? updatedFund : f)),
        }));
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

