import { useToastStore } from "../stores/toastStore";

/**
 * Hook for showing toast notifications
 * Provides convenient methods for success, error, info, and warning toasts
 */
export function useToast() {
  const addToast = useToastStore((state) => state.addToast);
  const success = useToastStore((state) => state.success);
  const error = useToastStore((state) => state.error);
  const info = useToastStore((state) => state.info);
  const warning = useToastStore((state) => state.warning);

  return {
    addToast,
    success,
    error,
    info,
    warning,
  };
}

