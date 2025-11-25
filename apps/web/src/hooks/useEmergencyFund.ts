import { useEmergencyFundStore } from "../stores/emergencyFundStore";
import { EmergencyFund, EmergencyFundTransaction } from "@flatflow/core";

export function useEmergencyFund() {
  const store = useEmergencyFundStore();

  return {
    funds: store.funds,
    addContribution: store.addContribution,
    addWithdrawal: store.addWithdrawal,
    updateFundName: store.updateFundName,
    deleteTransaction: store.deleteTransaction,
    recalculateBalance: store.recalculateBalance,
    getFundByFlatId: store.getFundByFlatId,
    getTransactionsByFlatId: store.getTransactionsByFlatId,
    resetFund: store.resetFund,
    resetAllFunds: store.resetAllFunds,
  };
}

