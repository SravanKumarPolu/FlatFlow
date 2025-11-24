import { Bill } from "@flatflow/core";

/**
 * Calculate the next due date for a bill based on its dueDay
 * @param bill - The bill to calculate the next due date for
 * @returns The next due date as a Date object
 */
export function getNextDueDate(bill: Bill): Date {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    // Validate dueDay
    const dueDay = Math.max(1, Math.min(31, bill.dueDay || 1));

    // Create a date for this month's due day
    const thisMonthDueDate = new Date(currentYear, currentMonth, dueDay);

    // If the due day has already passed this month, use next month
    if (currentDay > dueDay) {
      return new Date(currentYear, currentMonth + 1, dueDay);
    }

    // Otherwise, use this month's due date
    return thisMonthDueDate;
  } catch (error) {
    console.error("Error calculating next due date:", error, bill);
    // Return a safe default (today + 30 days)
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Format a date as "DD MMM" (e.g., "15 Jan")
 */
export function formatDueDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Format a date as "DD MMM YYYY" (e.g., "15 Jan 2024")
 */
export function formatDueDateFull(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Get days until due date
 */
export function getDaysUntilDue(bill: Bill): number {
  try {
    const nextDue = getNextDueDate(bill);
    const now = new Date();
    const diffTime = nextDue.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error("Error calculating days until due:", error, bill);
    return 0;
  }
}

