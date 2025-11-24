import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationsState {
  enabled: boolean;
  reminderDays: number[]; // Days before due date to remind (e.g., [3, 1, 0] = 3 days, 1 day, and on due date)
  setEnabled: (enabled: boolean) => void;
  setReminderDays: (days: number[]) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      enabled: false,
      reminderDays: [3, 1, 0], // Default: remind 3 days before, 1 day before, and on due date

      setEnabled: (enabled) => {
        set({ enabled });
      },

      setReminderDays: (days) => {
        set({ reminderDays: days });
      },
    }),
    {
      name: "flatflow-notifications-storage",
    }
  )
);

