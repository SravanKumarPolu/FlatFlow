import { useSettlementsStore } from "../stores/settlementsStore";
import { Settlement } from "@flatflow/core";

/**
 * Hook for managing settlements data
 * Provides access to settlements state and CRUD operations
 */
export function useSettlements() {
  const settlements = useSettlementsStore((state) => state.settlements);
  const addSettlement = useSettlementsStore((state) => state.addSettlement);
  const updateSettlement = useSettlementsStore(
    (state) => state.updateSettlement
  );
  const deleteSettlement = useSettlementsStore(
    (state) => state.deleteSettlement
  );
  const getSettlement = useSettlementsStore((state) => state.getSettlement);
  const getSettlementsByFlatId = useSettlementsStore(
    (state) => state.getSettlementsByFlatId
  );
  const getSettlementsByMember = useSettlementsStore(
    (state) => state.getSettlementsByMember
  );

  return {
    settlements,
    addSettlement,
    updateSettlement,
    deleteSettlement,
    getSettlement,
    getSettlementsByFlatId,
    getSettlementsByMember,
  };
}

