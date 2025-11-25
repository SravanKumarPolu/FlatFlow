/**
 * Logging Utility
 * 
 * Centralized logging for events and errors
 * Currently uses console, but ready to plug in analytics/error reporting services
 * 
 * TODO: Integrate with analytics service (e.g., Firebase Analytics, PostHog)
 * TODO: Integrate with error reporting (e.g., Sentry, LogRocket)
 */

interface LogContext {
  [key: string]: any;
}

/**
 * Log an event (e.g., user actions, screen views)
 * 
 * TODO: Replace console.log with analytics service
 * Example: Firebase Analytics:
 * ```
 * import { logEvent as firebaseLogEvent } from 'firebase/analytics';
 * firebaseLogEvent(analytics, name, params);
 * ```
 */
export function logEvent(name: string, params?: LogContext): void {
  if (import.meta.env.DEV) {
    console.log(`[Event] ${name}`, params || {});
  }

  // TODO: Send to analytics service
  // Example: analytics.track(name, params);
}

/**
 * Log an error with context
 * 
 * TODO: Replace console.error with error reporting service
 * Example: Sentry:
 * ```
 * import * as Sentry from '@sentry/react';
 * Sentry.captureException(error, { extra: context });
 * ```
 */
export function logError(error: unknown, context?: LogContext): void {
  const errorMessage =
    error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[Error] ${errorMessage}`, {
    error,
    stack: errorStack,
    context: context || {},
  });

  // TODO: Send to error reporting service
  // Example: Sentry.captureException(error, { extra: context });
}

/**
 * Log a warning
 */
export function logWarning(message: string, context?: LogContext): void {
  console.warn(`[Warning] ${message}`, context || {});

  // TODO: Optionally send to monitoring service
}

/**
 * Log info (for debugging)
 */
export function logInfo(message: string, context?: LogContext): void {
  if (import.meta.env.DEV) {
    console.info(`[Info] ${message}`, context || {});
  }
}




