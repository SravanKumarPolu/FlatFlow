import { useEffect, useRef } from "react";
import { useOnlineStatus } from "./useOnlineStatus";

/**
 * Hook for data synchronization
 * Currently a placeholder that logs when connectivity changes
 * 
 * TODO: Implement actual sync logic with backend/local DB
 * - When coming online: trigger sync of local changes to server
 * - When going offline: queue changes for later sync
 * - Use IndexedDB or local storage for offline data
 */
export function useDataSync() {
  const isOnline = useOnlineStatus();
  const wasOnlineRef = useRef(isOnline);

  useEffect(() => {
    // Log when connectivity status changes
    if (isOnline && !wasOnlineRef.current) {
      console.log("[DataSync] Back online - syncing data...");
      // TODO: Trigger sync with backend
      // Example: syncLocalChangesToServer()
    } else if (!isOnline && wasOnlineRef.current) {
      console.log("[DataSync] Offline - queuing changes locally");
      // TODO: Switch to offline mode
      // Example: enableOfflineMode()
    }

    wasOnlineRef.current = isOnline;
  }, [isOnline]);

  return {
    isOnline,
    // TODO: Add sync status, queued items count, etc.
  };
}

