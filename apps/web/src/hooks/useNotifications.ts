import { useState, useEffect, useCallback } from "react";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === "undefined") return "default";
    if (!("Notification" in window)) return "default";
    try {
      return Notification.permission;
    } catch {
      return "default";
    }
  });
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "Notification" in window);
    
    // Update permission state if Notification API becomes available
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        setPermission(Notification.permission);
      } catch {
        // Ignore errors
      }
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    if (permission === "granted") {
      return true;
    }

    if (permission === "denied") {
      return false;
    }

    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      return false;
    }
  }, [isSupported, permission]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || permission !== "granted") {
        return null;
      }

      if (typeof window === "undefined" || !("Notification" in window)) {
        return null;
      }

      try {
        const notification = new Notification(title, {
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        return notification;
      } catch (err) {
        console.error("Error showing notification:", err);
        return null;
      }
    },
    [isSupported, permission]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    canNotify: isSupported && permission === "granted",
  };
}

