import { Expense, ExpenseCategory } from "@flatflow/core";
import { SpendingLimit, ImpulseCategory } from "../stores/impulseControlStore";

export interface SpendingStatus {
  category: ImpulseCategory;
  currentWeekly: number;
  currentMonthly: number;
  weeklyLimit: number;
  monthlyLimit: number;
  weeklyExceeded: boolean;
  monthlyExceeded: boolean;
  weeklyPercentage: number;
  monthlyPercentage: number;
}

/**
 * Calculate current spending for impulse categories
 */
export function calculateSpendingStatus(
  expenses: Expense[],
  limits: SpendingLimit[]
): SpendingStatus[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const statuses: Map<ImpulseCategory, SpendingStatus> = new Map();

  limits.forEach((limit) => {
    if (!limit.enabled) return;

    const categoryExpenses = expenses.filter(
      (exp) => exp.category === limit.category
    );

    const weeklyExpenses = categoryExpenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= startOfWeek;
    });

    const monthlyExpenses = categoryExpenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= startOfMonth;
    });

    const currentWeekly = weeklyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const currentMonthly = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    statuses.set(limit.category, {
      category: limit.category,
      currentWeekly,
      currentMonthly,
      weeklyLimit: limit.weeklyLimit,
      monthlyLimit: limit.monthlyLimit,
      weeklyExceeded: currentWeekly > limit.weeklyLimit,
      monthlyExceeded: currentMonthly > limit.monthlyLimit,
      weeklyPercentage: limit.weeklyLimit > 0 ? (currentWeekly / limit.weeklyLimit) * 100 : 0,
      monthlyPercentage: limit.monthlyLimit > 0 ? (currentMonthly / limit.monthlyLimit) * 100 : 0,
    });
  });

  return Array.from(statuses.values());
}

/**
 * Check if user should be nudged before adding an expense
 */
export function shouldNudge(
  category: ExpenseCategory,
  amount: number,
  expenses: Expense[],
  limits: SpendingLimit[]
): { shouldNudge: boolean; message: string } {
  const impulseCategory = category as ImpulseCategory;
  const limit = limits.find((l) => l.category === impulseCategory);

  if (!limit || !limit.enabled) {
    return { shouldNudge: false, message: "" };
  }

  const statuses = calculateSpendingStatus(expenses, [limit]);
  const status = statuses.find((s) => s.category === impulseCategory);

  if (!status) {
    return { shouldNudge: false, message: "" };
  }

  // Check if adding this amount would exceed limits
  const newWeekly = status.currentWeekly + amount;
  const newMonthly = status.currentMonthly + amount;

  if (newWeekly > limit.weeklyLimit || newMonthly > limit.monthlyLimit) {
    let message = `⚠️ You're about to exceed your ${category} spending limit!\n\n`;
    message += `Current weekly: ₹${status.currentWeekly.toFixed(2)} / ₹${limit.weeklyLimit.toFixed(2)}\n`;
    message += `Current monthly: ₹${status.currentMonthly.toFixed(2)} / ₹${limit.monthlyLimit.toFixed(2)}\n\n`;
    message += `Adding ₹${amount.toFixed(2)} would exceed your limit. Are you sure?`;

    return { shouldNudge: true, message };
  }

  // Warn if close to limit (80% threshold)
  if (
    status.weeklyPercentage >= 80 ||
    status.monthlyPercentage >= 80
  ) {
    let message = `⚠️ You're close to your ${category} spending limit!\n\n`;
    message += `Weekly: ${status.weeklyPercentage.toFixed(0)}% used\n`;
    message += `Monthly: ${status.monthlyPercentage.toFixed(0)}% used\n\n`;
    message += `Are you sure you want to add this expense?`;

    return { shouldNudge: true, message };
  }

  return { shouldNudge: false, message: "" };
}

