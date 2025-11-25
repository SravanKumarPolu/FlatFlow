import { useState, useMemo } from "react";
import {
  PageHeader,
  AddExpenseModal,
  ConfirmDeleteModal,
} from "../../components/common";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "@flatflow/ui";
import { Expense } from "@flatflow/core";
import { useExpenses, useMembers, useToast, useFlat, useImpulseControl } from "../../hooks";
import { calculateSpendingStatus } from "../../lib/impulseControl";

export default function ExpensesPage() {
  const { expenses, deleteExpense, getExpensesByFlatId } = useExpenses();
  const { members } = useMembers();
  const { success } = useToast();
  const { getCurrentFlatId } = useFlat();
  const { limits, globalEnabled } = useImpulseControl();
  const currentFlatId = getCurrentFlatId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    expense: Expense | null;
  }>({ isOpen: false, expense: null });

  // Filter expenses for current flat
  const flatExpenses = useMemo(() => {
    if (!currentFlatId) return [];
    return getExpensesByFlatId(currentFlatId);
  }, [expenses, currentFlatId, getExpensesByFlatId]);

  // Helper to get member name by ID
  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member ? `${member.emoji || ""} ${member.name}`.trim() : `Member ${memberId.slice(-4)}`;
  };
  
  // Calculate total for current month
  const totalThisMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    
    return flatExpenses
      .filter((exp) => exp.date >= startOfMonth && exp.date <= endOfMonth)
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [flatExpenses]);

  // Calculate impulse control spending status
  const spendingStatuses = useMemo(() => {
    if (!globalEnabled) return [];
    return calculateSpendingStatus(flatExpenses, limits);
  }, [flatExpenses, limits, globalEnabled]);

  const getCategoryIcon = (category: Expense["category"]) => {
    const icons: Record<Expense["category"], string> = {
      RENT: "🏠",
      UTILITY: "⚡",
      FOOD: "🍽️",
      TRAVEL: "✈️",
      GROCERY: "🛒",
      SWIGGY: "🍔",
      OLA_UBER: "🚗",
      OTHER: "💰",
    };
    return icons[category] || "💰";
  };

  return (
    <>
      <PageHeader
        title="Expenses"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingExpense(null);
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
            Add Expense
          </Button>
        }
      />

      {/* Impulse Control Nudges */}
      {globalEnabled && spendingStatuses.length > 0 && (
        <div className="mb-6 space-y-2">
          {spendingStatuses
            .filter((status) => {
              const limit = limits.find((l) => l.category === status.category);
              return limit?.enabled && (status.weeklyPercentage >= 80 || status.monthlyPercentage >= 80);
            })
            .map((status) => {
              const limit = limits.find((l) => l.category === status.category);
              if (!limit) return null;

              const isExceeded = status.weeklyExceeded || status.monthlyExceeded;
              const isClose = !isExceeded && (status.weeklyPercentage >= 80 || status.monthlyPercentage >= 80);
              
              const categoryLabels: Record<string, string> = {
                SWIGGY: "Swiggy",
                OLA_UBER: "Ola/Uber",
                FOOD: "Food",
                TRAVEL: "Travel",
              };

              let message = "";
              if (isExceeded) {
                if (status.weeklyExceeded && status.monthlyExceeded) {
                  message = `You've crossed your ${categoryLabels[status.category]} weekly and monthly limits. Consider pausing new ${status.category.toLowerCase()} expenses this period.`;
                } else if (status.weeklyExceeded) {
                  message = `You've crossed your ${categoryLabels[status.category]} weekly limit. Consider pausing new ${status.category.toLowerCase()} expenses this week.`;
                } else {
                  message = `You've crossed your ${categoryLabels[status.category]} monthly limit. Consider pausing new ${status.category.toLowerCase()} expenses this month.`;
                }
              } else if (isClose) {
                message = `You're close to your ${categoryLabels[status.category]} spending limit. Want to slow down a bit?`;
              }

              if (!message) return null;

              return (
                <div
                  key={status.category}
                  className={`alert ${
                    isExceeded ? "alert-error" : "alert-warning"
                  } shadow-sm`}
                >
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="text-sm">{message}</span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Filters Row */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <select className="select select-bordered select-sm">
            <option>All Months</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
          <select className="select select-bordered select-sm">
            <option>All Categories</option>
            <option>Grocery</option>
            <option>Utility</option>
            <option>Food</option>
          </select>
        </div>
        <div className="stats shadow-sm">
          <div className="stat py-3 px-4 sm:px-6">
            <div className="stat-title">Total This Month</div>
            <div className="stat-value text-2xl sm:text-3xl">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(totalThisMonth)}
            </div>
          </div>
        </div>
      </div>

      {flatExpenses.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <EmptyState
              icon={<span className="text-5xl">💰</span>}
              title="No expenses yet"
              description="Start tracking shared expenses like groceries, utilities, and other costs."
              action={
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setEditingExpense(null);
                    setIsModalOpen(true);
                  }}
                >
                  Add Your First Expense
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {flatExpenses.map((expense) => {
            // Check if this expense category has impulse control limits
            const isImpulseCategory = ["SWIGGY", "OLA_UBER", "FOOD", "TRAVEL"].includes(expense.category);
            const categoryStatus = isImpulseCategory
              ? spendingStatuses.find((s) => s.category === expense.category)
              : null;
            const limit = isImpulseCategory
              ? limits.find((l) => l.category === expense.category)
              : null;
            const showWarning = globalEnabled &&
              limit?.enabled &&
              categoryStatus &&
              (categoryStatus.weeklyPercentage >= 80 || categoryStatus.monthlyPercentage >= 80);

            return (
              <div
                key={expense.id}
                className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-300"
              >
                <div className="card-body p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-2xl relative">
                        {getCategoryIcon(expense.category)}
                        {showWarning && (
                          <span
                            className={`absolute -top-1 -right-1 text-xs ${
                              categoryStatus?.weeklyExceeded || categoryStatus?.monthlyExceeded
                                ? "text-error"
                                : "text-warning"
                            }`}
                            title={
                              categoryStatus?.weeklyExceeded || categoryStatus?.monthlyExceeded
                                ? "Limit exceeded"
                                : "Close to limit"
                            }
                          >
                            ⚠️
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{expense.description}</h3>
                          {showWarning && (
                            <span
                              className={`badge badge-sm ${
                                categoryStatus?.weeklyExceeded || categoryStatus?.monthlyExceeded
                                  ? "badge-error"
                                  : "badge-warning"
                              }`}
                            >
                              {categoryStatus?.weeklyExceeded || categoryStatus?.monthlyExceeded
                                ? "Over Limit"
                                : "Near Limit"}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-base-content/60">
                        <span>
                          {new Date(expense.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="badge badge-outline badge-sm">
                          {expense.category}
                        </span>
                        <span>•</span>
                        <span>Paid by {getMemberName(expense.paidByMemberId)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(expense.amount)}
                    </p>
                  </div>
                </div>
                <div className="card-actions justify-end mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingExpense(expense);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDeleteConfirm({ isOpen: true, expense });
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        expense={editingExpense}
      />

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, expense: null })}
        onConfirm={() => {
          if (deleteConfirm.expense) {
            deleteExpense(deleteConfirm.expense.id);
            success(
              `Expense "${deleteConfirm.expense.description}" deleted successfully`
            );
          }
        }}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deleteConfirm.expense?.description}"?`}
        itemName={deleteConfirm.expense?.description}
      />
    </>
  );
}

