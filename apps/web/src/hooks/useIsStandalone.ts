import { useState, useEffect } from "react";

export function useIsStandalone(): boolean {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (PWA installed)
    const checkStandalone = () => {
      // For iOS Safari
      if (
        (window.navigator as { standalone?: boolean }).standalone === true
      ) {
        return true;
      }

      // For Android Chrome and other browsers
      if (window.matchMedia("(display-mode: standalone)").matches) {
        return true;
      }

      return false;
    };

    setIsStandalone(checkStandalone());
  }, []);

  return isStandalone;
}




