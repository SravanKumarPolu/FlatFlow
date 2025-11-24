import { useState, useMemo } from "react";
import {
  PageHeader,
  AddBillModal,
  ConfirmDeleteModal,
  MarkBillPaidModal,
  BillPaymentHistoryModal,
} from "../../components/common";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "@flatflow/ui";
import { Bill } from "@flatflow/core";
import { useBills, useToast, useBillPayments, useMembers, useFlat, useNotificationSettings } from "../../hooks";
import { getNextDueDate, formatDueDate, getDaysUntilDue } from "../../lib/billUtils";
import { getBillsNeedingReminders } from "../../lib/notifications";

export default function BillsPage() {
  const { bills, deleteBill, getBillsByFlatId } = useBills();
  const { success } = useToast();
  const { getPaymentsByBillId, getLatestPaymentForBill } = useBillPayments();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { reminderDays } = useNotificationSettings();
  const currentFlatId = getCurrentFlatId();

  // Filter bills for current flat
  const displayBills = useMemo(() => {
    if (!currentFlatId) return [];
    return getBillsByFlatId(currentFlatId);
  }, [bills, currentFlatId, getBillsByFlatId]);

  // Get bills needing reminders for visual indicators
  const billsNeedingReminders = useMemo(() => {
    if (!displayBills.length) return new Set<string>();
    const reminders = getBillsNeedingReminders(displayBills, reminderDays);
    return new Set(reminders.map((r) => r.billId));
  }, [displayBills, reminderDays]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [markPaidBill, setMarkPaidBill] = useState<Bill | null>(null);
  const [paymentHistoryBill, setPaymentHistoryBill] = useState<Bill | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    bill: Bill | null;
  }>({ isOpen: false, bill: null });

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member ? `${member.emoji || ""} ${member.name}`.trim() : `Member ${memberId.slice(-4)}`;
  };

  const getCategoryIcon = (category: Bill["category"]) => {
    const icons: Record<Bill["category"], string> = {
      RENT: "🏠",
      UTILITY: "⚡",
      MAID: "🧹",
      FOOD: "🍽️",
      OTHER: "📋",
    };
    return icons[category] || "📋";
  };

  // Safety check
  if (!bills) {
    return (
      <>
        <PageHeader title="Recurring Bills" />
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <p className="text-base-content/60">Loading bills...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Recurring Bills"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingBill(null);
              setIsModalOpen(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Bill
          </Button>
        }
      />

      {displayBills.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <EmptyState
              icon={<span className="text-5xl">📄</span>}
              title="No bills yet"
              description="Add recurring bills like rent, utilities, and subscriptions to track them automatically."
              action={
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setEditingBill(null);
                    setIsModalOpen(true);
                  }}
                >
                  Add Your First Bill
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayBills.map((bill) => {
            const daysUntil = (() => {
              try {
                return getDaysUntilDue(bill);
              } catch (e) {
                return null;
              }
            })();
            const isDueSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 3;
            const isOverdue = daysUntil !== null && daysUntil < 0;
            const needsReminder = billsNeedingReminders.has(bill.id);

            return (
            <div
              key={bill.id}
              className={`card bg-base-100 shadow-sm hover:shadow-md transition-shadow border cursor-pointer ${
                isOverdue
                  ? "border-error border-2"
                  : isDueSoon
                    ? "border-warning"
                    : needsReminder
                      ? "border-primary"
                      : "border-base-300"
              }`}
              onClick={() => setPaymentHistoryBill(bill)}
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">{getCategoryIcon(bill.category)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{bill.name}</h3>
                      <div className="flex flex-wrap gap-2 text-sm text-base-content/60">
                        <span>
                          Due: {(() => {
                            try {
                              return formatDueDate(getNextDueDate(bill));
                            } catch (e) {
                              return `${bill.dueDay || 1}th`;
                            }
                          })()} ({bill.dueDay || 1}th of month)
                          {daysUntil !== null && (
                            <>
                              {daysUntil >= 0 ? (
                                <span className={isDueSoon ? "font-bold text-warning" : ""}>
                                  {" "}• {daysUntil} day{daysUntil !== 1 ? "s" : ""} left
                                </span>
                              ) : (
                                <span className="font-bold text-error">
                                  {" "}• {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? "s" : ""} overdue
                                </span>
                              )}
                            </>
                          )}
                        </span>
                        {needsReminder && (
                          <span className="badge badge-primary badge-sm">⚠️ Reminder</span>
                        )}
                        {isOverdue && (
                          <span className="badge badge-error badge-sm">⚠️ Overdue</span>
                        )}
                        {isDueSoon && !isOverdue && (
                          <span className="badge badge-warning badge-sm">Due Soon</span>
                        )}
                        <span>•</span>
                        <span className="badge badge-outline">{bill.category}</span>
                        <span>•</span>
                        <span>
                          Split: {bill.splitType === "EQUAL" ? "Equal" : "Weighted"}
                        </span>
                      </div>
                      {(() => {
                        const latestPayment = getLatestPaymentForBill(bill.id);
                        const payments = getPaymentsByBillId(bill.id);
                        if (latestPayment) {
                          return (
                            <div className="mt-2 text-sm">
                              <span className="text-success font-medium">
                                Last paid {formatDueDate(new Date(latestPayment.paidDate))} by {getMemberName(latestPayment.paidByMemberId)}
                              </span>
                              {payments.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPaymentHistoryBill(bill);
                                  }}
                                  className="text-primary hover:underline ml-2"
                                >
                                  View {payments.length} payment{payments.length !== 1 ? "s" : ""}
                                </button>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(bill.amount)}
                    </p>
                    <span
                      className={`badge mt-2 ${
                        bill.isActive ? "badge-success" : "badge-neutral"
                      }`}
                    >
                      {bill.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="card-actions justify-end mt-4">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMarkPaidBill(bill);
                    }}
                  >
                    Mark as Paid
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBill(bill);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({ isOpen: true, bill });
                    }}
                  >
                    Delete
                  </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddBillModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBill(null);
        }}
        bill={editingBill}
      />

      {markPaidBill && (
        <MarkBillPaidModal
          isOpen={true}
          onClose={() => setMarkPaidBill(null)}
          bill={markPaidBill}
        />
      )}

      {paymentHistoryBill && (
        <BillPaymentHistoryModal
          isOpen={true}
          onClose={() => setPaymentHistoryBill(null)}
          bill={paymentHistoryBill}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, bill: null })}
        onConfirm={() => {
          if (deleteConfirm.bill) {
            deleteBill(deleteConfirm.bill.id);
            success(`Bill "${deleteConfirm.bill.name}" deleted successfully`);
          }
        }}
        title="Delete Bill"
        message={`Are you sure you want to delete ${deleteConfirm.bill?.name}?`}
        itemName={deleteConfirm.bill?.name}
      />
    </>
  );
}

