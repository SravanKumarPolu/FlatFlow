import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Expense } from "@flatflow/core";

interface ExpensesState {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpense: (id: string) => Expense | undefined;
  getExpensesByFlatId: (flatId: string) => Expense[];
  getExpensesByDateRange: (startDate: string, endDate: string) => Expense[];
  getExpensesByCategory: (category: Expense["category"]) => Expense[];
  resetExpenses: () => void;
}

const generateId = () => `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useExpensesStore = create<ExpensesState>()(
  persist(
    (set, get) => ({
      expenses: [],

      addExpense: (expenseData) => {
        const now = new Date().toISOString();
        const newExpense: Expense = {
          ...expenseData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          expenses: [...state.expenses, newExpense],
        }));
      },

      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id
              ? { ...expense, ...updates, updatedAt: new Date().toISOString() }
              : expense
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },

      getExpense: (id) => {
        return get().expenses.find((expense) => expense.id === id);
      },

      getExpensesByFlatId: (flatId) => {
        return get().expenses.filter((expense) => expense.flatId === flatId);
      },

      getExpensesByDateRange: (startDate, endDate) => {
        return get().expenses.filter(
          (expense) => expense.date >= startDate && expense.date <= endDate
        );
      },

      getExpensesByCategory: (category) => {
        return get().expenses.filter((expense) => expense.category === category);
      },

      resetExpenses: () => {
        set({ expenses: [] });
      },
    }),
    {
      name: "flatflow-expenses-storage",
    }
  )
);

