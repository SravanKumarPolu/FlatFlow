import { useState, useEffect } from "react";
import { isNative, isStandalone } from "../lib/platform";

/**
 * Hook to detect the current display mode
 * Returns whether app is running as standalone PWA or native Capacitor app
 */
export function useDisplayMode() {
  const [isStandalonePWA, setIsStandalonePWA] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    setIsStandalonePWA(isStandalone());
    setIsNativeApp(isNative());
  }, []);

  return {
    isStandalonePWA,
    isNativeApp,
    isMobileShell: isStandalonePWA || isNativeApp,
  };
}








