import { Chore } from "@flatflow/core";

/**
 * Calculate the next due date based on frequency
 * @param frequency - The frequency of the chore
 * @param fromDate - The date to calculate from (defaults to now)
 * @returns The next due date as an ISO string
 */
export function calculateNextDueDate(
  frequency: Chore["frequency"],
  fromDate: Date = new Date()
): string {
  const nextDate = new Date(fromDate);

  switch (frequency) {
    case "DAILY":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "WEEKLY":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "BI_WEEKLY":
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case "MONTHLY":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 7); // Default to weekly
  }

  return nextDate.toISOString();
}

/**
 * Get the status of a chore based on nextDueDate
 * @param chore - The chore to check
 * @returns ChoreStatus ("upcoming" | "due_today" | "overdue")
 */
export function getChoreStatus(chore: Chore): ChoreStatus {
  if (!chore.nextDueDate) return "upcoming";

  const now = new Date();
  const dueDate = new Date(chore.nextDueDate);
  
  // Set both to start of day for comparison
  now.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "overdue";
  } else if (diffDays === 0) {
    return "due_today";
  } else {
    return "upcoming";
  }
}

/**
 * Get the number of days until due (negative if overdue)
 */
export function getDaysUntilDue(chore: Chore): number | null {
  if (!chore.nextDueDate) return null;

  const now = new Date();
  const dueDate = new Date(chore.nextDueDate);
  
  now.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get frequency label for display
 */
export function getFrequencyLabel(frequency: Chore["frequency"]): string {
  switch (frequency) {
    case "DAILY":
      return "Daily";
    case "WEEKLY":
      return "Weekly";
    case "BI_WEEKLY":
      return "Bi-weekly";
    case "MONTHLY":
      return "Monthly";
    default:
      return frequency;
  }
}

/**
 * Pure helper function to get the next assignee in rotation
 * @param currentAssigneeId - The current assignee's member ID
 * @param assignedMembers - Array of member IDs in rotation order
 * @returns The next member ID in the rotation, or the first member if current is not found
 */
export function getNextAssignee(
  currentAssigneeId: string,
  assignedMembers: string[]
): string {
  if (assignedMembers.length === 0) {
    return currentAssigneeId;
  }

  if (assignedMembers.length === 1) {
    return assignedMembers[0];
  }

  const currentIndex = assignedMembers.indexOf(currentAssigneeId);
  
  // If current assignee not found in rotation, return first member
  if (currentIndex === -1) {
    return assignedMembers[0];
  }

  // Get next index (wrap around)
  const nextIndex = (currentIndex + 1) % assignedMembers.length;
  return assignedMembers[nextIndex];
}

/**
 * Chore status type
 */
export type ChoreStatus = "upcoming" | "due_today" | "overdue";

/**
 * Chore status labels for display
 */
export const CHORE_STATUS_LABELS: Record<ChoreStatus, string> = {
  upcoming: "Upcoming",
  due_today: "Due today",
  overdue: "Overdue",
};

