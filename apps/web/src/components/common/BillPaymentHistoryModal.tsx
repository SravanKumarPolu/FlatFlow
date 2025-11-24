import { useMemo } from "react";
import { Button } from "@flatflow/ui";
import { Bill, BillPayment } from "@flatflow/core";
import { useBillPayments, useMembers, useToast } from "../../hooks";
import { formatDueDateFull } from "../../lib/billUtils";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { EditPaymentModal } from "./EditPaymentModal";
import { useState } from "react";

interface BillPaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill;
}

export function BillPaymentHistoryModal({
  isOpen,
  onClose,
  bill,
}: BillPaymentHistoryModalProps) {
  const { getPaymentsByBillId, deletePayment } = useBillPayments();
  const { members } = useMembers();
  const { success } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    payment: BillPayment | null;
  }>({ isOpen: false, payment: null });
  const [editingPayment, setEditingPayment] = useState<BillPayment | null>(null);

  const payments = useMemo(() => {
    return getPaymentsByBillId(bill.id);
  }, [bill.id, getPaymentsByBillId]);

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member
      ? `${member.emoji || ""} ${member.name}`.trim()
      : `Member ${memberId.slice(-4)}`;
  };

  const handleDelete = (payment: BillPayment) => {
    setDeleteConfirm({ isOpen: true, payment });
  };

  const confirmDelete = () => {
    if (deleteConfirm.payment) {
      deletePayment(deleteConfirm.payment.id);
      success("Payment deleted successfully");
      setDeleteConfirm({ isOpen: false, payment: null });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <input
        type="checkbox"
        id="bill-payment-history-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className={`modal ${isOpen ? "modal-open" : ""}`} role="dialog">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-2">Payment History</h3>
          <div className="mb-4">
            <p className="text-lg font-semibold">{bill.name}</p>
            <p className="text-sm text-base-content/60">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(bill.amount)}
            </p>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-base-content/60">No payments recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {payments.map((payment, index) => (
                <div
                  key={payment.id}
                  className="card bg-base-200 border border-base-300"
                >
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl font-bold text-primary">
                            #{payments.length - index}
                          </span>
                          <div className="divider divider-horizontal m-0"></div>
                          <div>
                            <p className="font-semibold">
                              {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                              }).format(payment.amount)}
                            </p>
                            <p className="text-sm text-base-content/60">
                              Paid by {getMemberName(payment.paidByMemberId)}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-base-content/60 space-y-1">
                          <p>
                            Date: {formatDueDateFull(new Date(payment.paidDate))}
                          </p>
                          {payment.note && (
                            <p className="italic">Note: {payment.note}</p>
                          )}
                          <p className="text-xs">
                            Recorded: {formatDueDateFull(new Date(payment.createdAt))}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingPayment(payment)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(payment)}
                          className="text-error"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="modal-action">
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        <label className="modal-backdrop" onClick={onClose}></label>
      </div>

      <EditPaymentModal
        isOpen={editingPayment !== null}
        onClose={() => setEditingPayment(null)}
        payment={editingPayment!}
      />

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, payment: null })}
        onConfirm={confirmDelete}
        title="Delete Payment"
        message={`Are you sure you want to delete this payment record?`}
        itemName="payment"
      />
    </>
  );
}

