/**
 * Environment Configuration
 * 
 * Centralized access to environment variables
 * Avoids importing import.meta.env throughout the codebase
 */

/**
 * API Configuration
 * 
 * TODO: Set these in .env and .env.production files:
 * 
 * .env (development):
 * VITE_API_BASE_URL=http://localhost:4000
 * 
 * .env.production:
 * VITE_API_BASE_URL=https://api.yourapp.com
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "";

export const ENV = {
  MODE: import.meta.env.MODE || "development",
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  API_BASE_URL,
};

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return ENV.PROD === true;
};

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => {
  return ENV.DEV === true;
};

/**
 * Get API endpoint URL
 * @param path - API path (e.g., "/api/users")
 * @returns Full URL or path relative to base URL
 */
export const getApiUrl = (path: string): string => {
  if (!API_BASE_URL) {
    return path; // Relative URL if no base URL configured
  }
  const base = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
};




