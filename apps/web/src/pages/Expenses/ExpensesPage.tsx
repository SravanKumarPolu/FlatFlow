import { useState, useMemo } from "react";
import {
  PageHeader,
  AddExpenseModal,
  ConfirmDeleteModal,
} from "../../components/common";
import { EmptyState } from "../../components/common/EmptyState";
import { Button } from "@flatflow/ui";
import { Expense } from "@flatflow/core";
import { useExpenses, useMembers, useToast, useFlat } from "../../hooks";

export default function ExpensesPage() {
  const { expenses, deleteExpense, getExpensesByFlatId } = useExpenses();
  const { members } = useMembers();
  const { success } = useToast();
  const { getCurrentFlatId } = useFlat();
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
          {flatExpenses.map((expense) => (
            <div
              key={expense.id}
              className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-300"
            >
              <div className="card-body p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl">{getCategoryIcon(expense.category)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{expense.description}</h3>
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
            </div>
          ))}
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

