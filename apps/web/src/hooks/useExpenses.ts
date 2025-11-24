import { useExpensesStore } from "../stores/expensesStore";
import { Expense } from "@flatflow/core";

/**
 * Hook for managing expenses data
 * Provides access to expenses state and CRUD operations
 */
export function useExpenses() {
  const expenses = useExpensesStore((state) => state.expenses);
  const addExpense = useExpensesStore((state) => state.addExpense);
  const updateExpense = useExpensesStore((state) => state.updateExpense);
  const deleteExpense = useExpensesStore((state) => state.deleteExpense);
  const getExpense = useExpensesStore((state) => state.getExpense);
  const getExpensesByFlatId = useExpensesStore((state) => state.getExpensesByFlatId);
  const getExpensesByDateRange = useExpensesStore((state) => state.getExpensesByDateRange);
  const getExpensesByCategory = useExpensesStore((state) => state.getExpensesByCategory);

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpense,
    getExpensesByFlatId,
    getExpensesByDateRange,
    getExpensesByCategory,
  };
}

