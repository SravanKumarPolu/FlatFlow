/**
 * Platform Detection Utilities
 * 
 * Detects the runtime environment (web, PWA, or native Capacitor)
 */

/**
 * Check if running in native Capacitor environment
 * @returns true if running in Capacitor native app
 */
export const isNative = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window as any).Capacitor;
};

/**
 * Check if running in standalone/PWA mode (browser-installed)
 * @returns true if installed as PWA
 */
export const isStandalone = (): boolean => {
  if (typeof window === "undefined") return false;

  // iOS Safari
  if ((window.navigator as { standalone?: boolean }).standalone === true) {
    return true;
  }

  // Android Chrome and other browsers
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }

  return false;
};

/**
 * Get the current platform type
 * @returns "native" | "standalone" | "web"
 */
export const getPlatform = (): "native" | "standalone" | "web" => {
  if (isNative()) return "native";
  if (isStandalone()) return "standalone";
  return "web";
};

/**
 * Check if running in mobile environment (native or mobile browser)
 * @returns true if on mobile device
 */
export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
};






