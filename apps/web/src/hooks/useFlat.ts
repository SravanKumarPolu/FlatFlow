import { useFlatStore } from "../stores/flatStore";
import { Flat } from "@flatflow/core";

/**
 * Hook for managing the current flat
 * Provides access to flat state and operations
 */
export function useFlat() {
  const currentFlat = useFlatStore((state) => state.currentFlat);
  const setCurrentFlat = useFlatStore((state) => state.setCurrentFlat);
  const updateCurrentFlat = useFlatStore((state) => state.updateCurrentFlat);
  const createFlat = useFlatStore((state) => state.createFlat);

  // Get current flat ID, with fallback to default for MVP
  const getCurrentFlatId = () => {
    return currentFlat?.id || "flat1";
  };

  return {
    currentFlat,
    setCurrentFlat,
    updateCurrentFlat,
    createFlat,
    getCurrentFlatId,
  };
}

