import { useBillPaymentsStore } from "../stores/billPaymentsStore";
import { BillPayment } from "@flatflow/core";

export function useBillPayments() {
  const store = useBillPaymentsStore();

  return {
    payments: store.payments,
    addPayment: store.addPayment,
    updatePayment: store.updatePayment,
    deletePayment: store.deletePayment,
    getPayment: store.getPayment,
    getPaymentsByBillId: store.getPaymentsByBillId,
    getPaymentsByFlatId: store.getPaymentsByFlatId,
    getLatestPaymentForBill: store.getLatestPaymentForBill,
    resetPayments: store.resetPayments,
  };
}

