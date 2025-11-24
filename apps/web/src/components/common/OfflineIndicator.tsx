import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useState, useEffect, useRef } from "react";

/**
 * Offline Indicator Component
 * Shows a subtle indicator when the app is offline
 * Shows a brief success toast when coming back online
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const wasOnlineRef = useRef(isOnline);

  useEffect(() => {
    // Show toast when coming back online
    if (isOnline && !wasOnlineRef.current) {
      setShowOnlineToast(true);
      const timer = setTimeout(() => setShowOnlineToast(false), 3000);
      return () => clearTimeout(timer);
    }
    wasOnlineRef.current = isOnline;
  }, [isOnline]);

  if (isOnline && !showOnlineToast) {
    return null;
  }

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-warning/90 text-warning-content px-4 py-2 text-sm text-center">
          <span className="font-medium">Offline</span> – Changes might not sync
        </div>
      )}

      {/* Online Toast */}
      {showOnlineToast && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success">
            <span className="text-sm">Back online – syncing</span>
          </div>
        </div>
      )}
    </>
  );
}

