import { useNotificationsStore } from "../stores/notificationsStore";
import { useNotifications } from "./useNotifications";

export function useNotificationSettings() {
  const store = useNotificationsStore();
  const { isSupported, permission, requestPermission, showNotification, canNotify } =
    useNotifications();

  return {
    isSupported,
    permission,
    enabled: store.enabled,
    reminderDays: store.reminderDays,
    canNotify,
    setEnabled: store.setEnabled,
    setReminderDays: store.setReminderDays,
    requestPermission,
    showNotification,
  };
}

