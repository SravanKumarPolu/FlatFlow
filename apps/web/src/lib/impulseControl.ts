import { Expense, ExpenseCategory } from "@flatflow/core";
import { SpendingLimit, ImpulseCategory } from "../stores/impulseControlStore";

export interface SpendingStatus {
  category: ImpulseCategory;
  currentWeekly: number;
  currentMonthly: number;
  weeklyLimit: number | null;
  monthlyLimit: number | null;
  weeklyExceeded: boolean;
  monthlyExceeded: boolean;
  weeklyPercentage: number;
  monthlyPercentage: number;
  weeklyRemaining: number | null;
  monthlyRemaining: number | null;
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
      weeklyExceeded: limit.weeklyLimit !== null && currentWeekly >= limit.weeklyLimit,
      monthlyExceeded: limit.monthlyLimit !== null && currentMonthly >= limit.monthlyLimit,
      weeklyPercentage: limit.weeklyLimit !== null && limit.weeklyLimit > 0 ? (currentWeekly / limit.weeklyLimit) * 100 : 0,
      monthlyPercentage: limit.monthlyLimit !== null && limit.monthlyLimit > 0 ? (currentMonthly / limit.monthlyLimit) * 100 : 0,
      weeklyRemaining: limit.weeklyLimit !== null ? limit.weeklyLimit - currentWeekly : null,
      monthlyRemaining: limit.monthlyLimit !== null ? limit.monthlyLimit - currentMonthly : null,
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
  limits: SpendingLimit[],
  globalEnabled: boolean = true
): { shouldNudge: boolean; message: string } {
  // Check global toggle first
  if (!globalEnabled) {
    return { shouldNudge: false, message: "" };
  }

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

  // Hard nudge: >= 100% of limit (reaches or exceeds)
  const wouldExceedWeekly = limit.weeklyLimit !== null && newWeekly >= limit.weeklyLimit;
  const wouldExceedMonthly = limit.monthlyLimit !== null && newMonthly >= limit.monthlyLimit;

  if (wouldExceedWeekly || wouldExceedMonthly) {
    let message = "";
    if (wouldExceedWeekly && wouldExceedMonthly) {
      message = `You've crossed your ${category} weekly and monthly limits. Consider pausing new ${category.toLowerCase()} expenses this period.`;
    } else if (wouldExceedWeekly) {
      message = `You've crossed your ${category} weekly limit. Consider pausing new ${category.toLowerCase()} expenses this week.`;
    } else {
      message = `You've crossed your ${category} monthly limit. Consider pausing new ${category.toLowerCase()} expenses this month.`;
    }

    return { shouldNudge: true, message };
  }

  // Soft nudge: 80-90% of limit
  if (
    (limit.weeklyLimit !== null && status.weeklyPercentage >= 80 && status.weeklyPercentage < 100) ||
    (limit.monthlyLimit !== null && status.monthlyPercentage >= 80 && status.monthlyPercentage < 100)
  ) {
    const categoryName = category === "SWIGGY" ? "Swiggy" : category === "OLA_UBER" ? "Ola/Uber" : category;
    let message = `You're close to your ${categoryName} spending limit. Want to slow down a bit?`;
    
    if (status.weeklyPercentage >= 80 && limit.weeklyLimit !== null) {
      message += ` (${status.weeklyPercentage.toFixed(0)}% of weekly limit used)`;
    }
    if (status.monthlyPercentage >= 80 && limit.monthlyLimit !== null) {
      message += ` (${status.monthlyPercentage.toFixed(0)}% of monthly limit used)`;
    }

    return { shouldNudge: true, message };
  }

  return { shouldNudge: false, message: "" };
}

