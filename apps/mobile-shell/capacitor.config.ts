import { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor Configuration for FlatFlow
 * 
 * This config wraps the FlatFlow PWA into native Android and iOS apps.
 * 
 * IMPORTANT: webDir Path
 * - Current structure: Vite app lives in apps/web/
 * - Build output: apps/web/dist/ (set in vite.config.ts)
 * - webDir path: ../../apps/web/dist (relative to this config file)
 * 
 * If the project structure changes:
 * - If web app moves to root: change to "dist"
 * - If monorepo structure changes: adjust relative path accordingly
 * - Always ensure webDir points to the same directory as vite.config.ts build.outDir
 */
const config: CapacitorConfig = {
  appId: "com.flatflow.app", // Android package name / iOS bundle ID
  appName: "FlatFlow",
  
  // Path to built web assets (matches vite.config.ts build.outDir)
  // Monorepo structure: apps/mobile-shell/ -> apps/web/dist/
  webDir: "../../apps/web/dist",
  
  // Use the web app's own runtime, not Capacitor's bundled one
  // This allows PWA features (service worker, manifest) to work properly
  bundledWebRuntime: false,
  
  /**
   * Server Configuration (Optional)
   * 
   * EMBEDDED MODE (Current - Recommended for Production):
   * - Leave server config commented out
   * - Native apps use bundled web assets from webDir
   * - App works offline after initial load
   * - Better performance, no network dependency
   * 
   * HOSTED MODE (For Development or Always-Latest App):
   * - Uncomment server config below
   * - Point to deployed web app URL
   * - Native apps load from remote server
   * - Good for: testing against dev server, always-latest deployments
   * - Note: Requires network connection
   */
  // server: {
  //   // For local development (requires device on same network or ngrok/tunneling):
  //   // url: "http://localhost:3000", // Or http://YOUR_IP:3000
  //   // cleartext: true, // Required for localhost/HTTP
  //   
  //   // For production deployed app (always-latest mode):
  //   // url: "https://your-production-domain.com",
  //   // cleartext: false, // HTTPS only
  // },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0ea5e9", // Matches theme color
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#0ea5e9", // Matches theme color
    },
    Keyboard: {
      resize: "body", // Resize viewport when keyboard appears
      style: "dark", // Keyboard style (iOS)
      resizeOnFullScreen: true, // Android
    },
    App: {
      launchUrl: "", // Deep linking configuration (if needed later)
    },
  },
};

export default config;

