import { useState, useMemo, useCallback } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { EmergencyFundTransactionModal } from "../../components/common/EmergencyFundTransactionModal";
import { EditFundNameModal } from "../../components/common/EditFundNameModal";
import { ConfirmDeleteModal } from "../../components/common/ConfirmDeleteModal";
import { Button, Input } from "@flatflow/ui";
import { useEmergencyFund, useMembers, useFlat, useToast } from "../../hooks";
import { EmergencyFundTransaction } from "@flatflow/core";

export default function EmergencyFundPage() {
  const {
    getFundByFlatId,
    getTransactionsByFlatId,
    deleteTransaction,
    recalculateBalance,
  } = useEmergencyFund();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { error, success } = useToast();
  const currentFlatId = getCurrentFlatId();

  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    type: "CONTRIBUTION" | "WITHDRAWAL";
  }>({ isOpen: false, type: "CONTRIBUTION" });
  const [editNameModal, setEditNameModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    transaction: EmergencyFundTransaction | null;
  }>({ isOpen: false, transaction: null });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMember, setFilterMember] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "CONTRIBUTION" | "WITHDRAWAL">("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const fund = currentFlatId ? getFundByFlatId(currentFlatId) : undefined;
  const allTransactions = currentFlatId
    ? getTransactionsByFlatId(currentFlatId)
    : [];

  const flatMembers = useMemo(() => {
    if (!currentFlatId) return [];
    return members.filter((m) => m.flatId === currentFlatId);
  }, [members, currentFlatId]);

  const getMemberName = useCallback(
    (memberId: string) => {
      const member = flatMembers.find((m) => m.id === memberId);
      return member
        ? `${member.emoji || ""} ${member.name}`.trim()
        : `Member ${memberId.slice(-4)}`;
    },
    [flatMembers]
  );

  // Calculate balance from transactions (derived, not stored)
  const currentBalance = useMemo(() => {
    return allTransactions.reduce((sum, t) => {
      return t.type === "CONTRIBUTION" ? sum + t.amount : sum - t.amount;
    }, 0);
  }, [allTransactions]);

  const totalContributions = useMemo(() => {
    return allTransactions
      .filter((t) => t.type === "CONTRIBUTION")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [allTransactions]);

  const totalWithdrawals = useMemo(() => {
    return allTransactions
      .filter((t) => t.type === "WITHDRAWAL")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [allTransactions]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    let result = [...allTransactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          getMemberName(t.memberId).toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.amount.toString().includes(query)
      );
    }

    // Member filter
    if (filterMember !== "ALL") {
      result = result.filter((t) => t.memberId === filterMember);
    }

    // Type filter
    if (filterType !== "ALL") {
      result = result.filter((t) => t.type === filterType);
    }

    // Date range filters
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      result = result.filter((t) => new Date(t.date) >= fromDate);
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999); // Include entire day
      result = result.filter((t) => new Date(t.date) <= toDate);
    }

    // Sort by latest date (already sorted in store, but ensure it's maintained)
    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [
    allTransactions,
    searchQuery,
    filterMember,
    filterType,
    filterDateFrom,
    filterDateTo,
    getMemberName,
  ]);

  return (
    <>
      <PageHeader
        title={fund?.name || "Emergency Fund"}
        subtitle="Shared fund for repairs, deposits, and emergencies"
        actions={
          fund && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditNameModal(true)}
              >
                Edit Name
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (currentFlatId) {
                    recalculateBalance(currentFlatId);
                    success("Balance recalculated successfully");
                  }
                }}
                title="Recalculate balance from transactions"
              >
                Recalculate Balance
              </Button>
            </div>
          )
        }
      />

      {!fund || allTransactions.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <EmptyState
              icon={<span className="text-5xl">💰</span>}
              title="No emergency fund yet"
              description="Start an emergency fund to cover repairs, appliance damage, deposits, and other shared expenses."
              action={
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() =>
                    setTransactionModal({ isOpen: true, type: "CONTRIBUTION" })
                  }
                >
                  Make First Contribution
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <>
          {/* Balance Card */}
          <div className="card bg-base-100 shadow-lg mb-6 border-2 border-primary">
            <div className="card-body text-center">
              <h2 className="card-title justify-center text-2xl mb-2">
                Current Balance
              </h2>
              <div className="text-5xl font-bold text-primary mb-4">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(currentBalance)}
              </div>
              <div className="stats stats-horizontal shadow-sm w-full">
                <div className="stat">
                  <div className="stat-title">Total Contributions</div>
                  <div className="stat-value text-lg text-success">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(totalContributions)}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title">Total Withdrawals</div>
                  <div className="stat-value text-lg text-error">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(totalWithdrawals)}
                  </div>
                </div>
              </div>
              <div className="card-actions justify-center gap-2 mt-4">
                <Button
                  variant="primary"
                  onClick={() =>
                    setTransactionModal({ isOpen: true, type: "CONTRIBUTION" })
                  }
                >
                  Add Contribution
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setTransactionModal({ isOpen: true, type: "WITHDRAWAL" })
                  }
                  disabled={currentBalance === 0}
                >
                  Record Withdrawal
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card bg-base-100 shadow-sm mb-6">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Transaction History</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search */}
                <div className="md:col-span-2 lg:col-span-4">
                  <Input
                    label="Search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by member, description, amount..."
                  />
                </div>

                {/* Member Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Filter by Member</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={filterMember}
                    onChange={(e) => setFilterMember(e.target.value)}
                  >
                    <option value="ALL">All Members</option>
                    {flatMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.emoji} {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Filter by Type</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={filterType}
                    onChange={(e) =>
                      setFilterType(
                        e.target.value as "ALL" | "CONTRIBUTION" | "WITHDRAWAL"
                      )
                    }
                  >
                    <option value="ALL">All Types</option>
                    <option value="CONTRIBUTION">Contributions</option>
                    <option value="WITHDRAWAL">Withdrawals</option>
                  </select>
                </div>

                {/* Date From Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Date From</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                  />
                </div>

                {/* Date To Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Date To</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="stats stats-horizontal shadow-sm">
                <div className="stat py-2 px-4">
                  <div className="stat-title text-xs">Total Transactions</div>
                  <div className="stat-value text-lg">{allTransactions.length}</div>
                </div>
                <div className="stat py-2 px-4">
                  <div className="stat-title text-xs">Filtered</div>
                  <div className="stat-value text-lg">{filteredTransactions.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              {filteredTransactions.length === 0 ? (
                <p className="text-base-content/60 text-center py-4">
                  {allTransactions.length === 0
                    ? "No transactions yet"
                    : "No transactions match your filters"}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Member</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover">
                          <td>
                            {new Date(transaction.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                transaction.type === "CONTRIBUTION"
                                  ? "badge-success"
                                  : "badge-error"
                              }`}
                            >
                              {transaction.type === "CONTRIBUTION"
                                ? "Contribution"
                                : "Withdrawal"}
                            </span>
                          </td>
                          <td>{getMemberName(transaction.memberId)}</td>
                          <td className="font-bold">
                            {transaction.type === "CONTRIBUTION" ? "+" : "-"}
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                            }).format(transaction.amount)}
                          </td>
                          <td className="text-sm text-base-content/60">
                            {transaction.description || "-"}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-error"
                              onClick={() =>
                                setDeleteConfirm({ isOpen: true, transaction })
                              }
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <EmergencyFundTransactionModal
        isOpen={transactionModal.isOpen}
        onClose={() => setTransactionModal({ isOpen: false, type: "CONTRIBUTION" })}
        type={transactionModal.type}
      />

      <EditFundNameModal
        isOpen={editNameModal}
        onClose={() => setEditNameModal(false)}
        currentName={fund?.name}
      />

      <ConfirmDeleteModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, transaction: null })}
        onConfirm={() => {
          if (deleteConfirm.transaction && currentFlatId) {
            deleteTransaction(currentFlatId, deleteConfirm.transaction.id);
            success("Transaction deleted successfully");
            setDeleteConfirm({ isOpen: false, transaction: null });
          }
        }}
        title="Delete Transaction"
        message={`Are you sure you want to delete this ${deleteConfirm.transaction?.type.toLowerCase()} transaction?`}
        itemName={`${deleteConfirm.transaction?.type} of ₹${deleteConfirm.transaction?.amount}`}
      />
    </>
  );
}
