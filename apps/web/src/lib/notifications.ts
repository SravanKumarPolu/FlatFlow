import { Bill, Chore } from "@flatflow/core";
import { getNextDueDate, getDaysUntilDue } from "./billUtils";

export interface BillReminder {
  billId: string;
  billName: string;
  dueDate: Date;
  amount: number;
  daysUntilDue: number;
}

/**
 * Get bills that need reminders (within specified days)
 */
export function getBillsNeedingReminders(
  bills: Bill[],
  reminderDays: number[] = [3, 1, 0]
): BillReminder[] {
  const now = new Date();
  const reminders: BillReminder[] = [];

  bills
    .filter((bill) => bill.isActive)
    .forEach((bill) => {
      const dueDate = getNextDueDate(bill);
      const daysUntil = getDaysUntilDue(bill);

      // Check if bill is due within any of the reminder days
      if (reminderDays.includes(daysUntil) && daysUntil >= 0) {
        reminders.push({
          billId: bill.id,
          billName: bill.name,
          dueDate,
          amount: bill.amount,
          daysUntilDue: daysUntil,
        });
      }
    });

  return reminders.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

/**
 * Format reminder message
 */
export function formatReminderMessage(reminder: BillReminder): string {
  const daysText =
    reminder.daysUntilDue === 0
      ? "due today"
      : reminder.daysUntilDue === 1
      ? "due tomorrow"
      : `due in ${reminder.daysUntilDue} days`;

  return `${reminder.billName} is ${daysText}. Amount: ₹${reminder.amount.toLocaleString("en-IN")}`;
}

/**
 * Check and show bill reminders
 */
export function checkAndShowBillReminders(
  bills: Bill[],
  showNotification: (title: string, options?: NotificationOptions) => Notification | null,
  reminderDays: number[] = [3, 1, 0]
): void {
  const reminders = getBillsNeedingReminders(bills, reminderDays);

  reminders.forEach((reminder) => {
    const message = formatReminderMessage(reminder);
    showNotification("Bill Reminder", {
      body: message,
      tag: `bill-reminder-${reminder.billId}`, // Prevent duplicate notifications
      requireInteraction: reminder.daysUntilDue === 0, // Require interaction if due today
    });
  });
}

export interface ChoreReminder {
  choreId: string;
  choreName: string;
  assignedToMemberId: string;
  daysOverdue: number;
  frequency: Chore["frequency"];
}

/**
 * Get chores that need reminders (overdue chores)
 */
export function getChoresNeedingReminders(
  chores: Chore[],
  currentUserId?: string | null
): ChoreReminder[] {
  const now = new Date();
  const reminders: ChoreReminder[] = [];

  chores
    .filter((chore) => chore.isActive && chore.currentAssigneeId)
    .forEach((chore) => {
      // Only show reminders for chores assigned to current user (if userId provided)
      if (currentUserId && chore.currentAssigneeId !== currentUserId) {
        return;
      }

      if (!chore.lastCompletedAt) {
        // Chore never completed - check if it's overdue based on creation date
        const createdDate = new Date(chore.createdAt);
        const daysSinceCreation = Math.floor(
          (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const thresholdDays =
          chore.frequency === "DAILY"
            ? 1
            : chore.frequency === "WEEKLY"
            ? 7
            : chore.frequency === "BI_WEEKLY"
            ? 14
            : 30; // MONTHLY

        if (daysSinceCreation >= thresholdDays) {
          reminders.push({
            choreId: chore.id,
            choreName: chore.name,
            assignedToMemberId: chore.currentAssigneeId,
            daysOverdue: daysSinceCreation - thresholdDays + 1,
            frequency: chore.frequency,
          });
        }
      } else {
        // Chore was completed before - check if overdue
        const lastCompleted = new Date(chore.lastCompletedAt);
        const daysSince = Math.floor(
          (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
        );

        const thresholdDays =
          chore.frequency === "DAILY"
            ? 1
            : chore.frequency === "WEEKLY"
            ? 7
            : chore.frequency === "BI_WEEKLY"
            ? 14
            : 30; // MONTHLY

        if (daysSince >= thresholdDays) {
          reminders.push({
            choreId: chore.id,
            choreName: chore.name,
            assignedToMemberId: chore.currentAssigneeId,
            daysOverdue: daysSince - thresholdDays + 1,
            frequency: chore.frequency,
          });
        }
      }
    });

  return reminders.sort((a, b) => b.daysOverdue - a.daysOverdue);
}

/**
 * Format chore reminder message
 */
export function formatChoreReminderMessage(reminder: ChoreReminder): string {
  const daysText =
    reminder.daysOverdue === 1
      ? "1 day overdue"
      : `${reminder.daysOverdue} days overdue`;

  return `${reminder.choreName} is ${daysText} (${reminder.frequency})`;
}

/**
 * Check and show chore reminders
 */
export function checkAndShowChoreReminders(
  chores: Chore[],
  showNotification: (title: string, options?: NotificationOptions) => Notification | null,
  currentUserId?: string | null
): void {
  const reminders = getChoresNeedingReminders(chores, currentUserId);

  reminders.forEach((reminder) => {
    const message = formatChoreReminderMessage(reminder);
    showNotification("Chore Reminder", {
      body: message,
      tag: `chore-reminder-${reminder.choreId}`, // Prevent duplicate notifications
      requireInteraction: true, // Always require interaction for overdue chores
    });
  });
}

