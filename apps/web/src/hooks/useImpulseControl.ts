import { useImpulseControlStore } from "../stores/impulseControlStore";

export function useImpulseControl() {
  const store = useImpulseControlStore();

  return {
    limits: store.limits,
    globalEnabled: store.globalEnabled,
    setLimit: store.setLimit,
    getLimit: store.getLimit,
    setGlobalEnabled: store.setGlobalEnabled,
    resetLimits: store.resetLimits,
    // Helper to check if nudges should be shown (global + category enabled)
    shouldShowNudges: (categoryEnabled: boolean) => {
      return store.globalEnabled && categoryEnabled;
    },
  };
}

