/**
 * App Information Configuration
 * 
 * Centralized app metadata for display and versioning
 */

// Read from environment or fallback to package.json
const APP_VERSION =
  import.meta.env.VITE_APP_VERSION || import.meta.env.npm_package_version || "0.1.0";

export const APP_NAME = "FlatFlow";
export const APP_VERSION_NUMBER = APP_VERSION;
export const BUILD_ENV = import.meta.env.MODE || "development";
export const IS_PRODUCTION = BUILD_ENV === "production";
export const IS_DEVELOPMENT = BUILD_ENV === "development";

/**
 * Get full app version string with environment
 */
export function getAppVersionString(): string {
  if (IS_PRODUCTION) {
    return APP_VERSION_NUMBER;
  }
  return `${APP_VERSION_NUMBER} (${BUILD_ENV})`;
}

/**
 * Build-time injection example:
 * 
 * In vite.config.ts or at build time, you can inject version:
 * ```
 * define: {
 *   'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
 * }
 * ```
 * 
 * Or use environment variable:
 * VITE_APP_VERSION=1.0.0 pnpm build
 */




