import { useImpulseControlStore, SpendingLimit, ImpulseCategory } from "../stores/impulseControlStore";

export function useImpulseControl() {
  const store = useImpulseControlStore();

  return {
    limits: store.limits,
    setLimit: store.setLimit,
    getLimit: store.getLimit,
    resetLimits: store.resetLimits,
  };
}

