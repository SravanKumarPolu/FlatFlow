import { Bill } from "@flatflow/core";
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

