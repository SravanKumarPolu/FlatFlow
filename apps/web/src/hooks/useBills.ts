import { useBillsStore } from "../stores/billsStore";

/**
 * Hook for managing bills data
 * Provides access to bills state and CRUD operations
 */
export function useBills() {
  const bills = useBillsStore((state) => state.bills);
  const addBill = useBillsStore((state) => state.addBill);
  const updateBill = useBillsStore((state) => state.updateBill);
  const deleteBill = useBillsStore((state) => state.deleteBill);
  const getBill = useBillsStore((state) => state.getBill);
  const getActiveBills = useBillsStore((state) => state.getActiveBills);
  const getBillsByFlatId = useBillsStore((state) => state.getBillsByFlatId);

  return {
    bills,
    addBill,
    updateBill,
    deleteBill,
    getBill,
    getActiveBills,
    getBillsByFlatId,
  };
}

