import { useState, useMemo } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { EmergencyFundTransactionModal } from "../../components/common/EmergencyFundTransactionModal";
import { Button } from "@flatflow/ui";
import { useEmergencyFund, useMembers, useFlat, useToast } from "../../hooks";

export default function EmergencyFundPage() {
  const { getFundByFlatId, getTransactionsByFlatId } = useEmergencyFund();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { error } = useToast();
  const currentFlatId = getCurrentFlatId();

  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    type: "CONTRIBUTION" | "WITHDRAWAL";
  }>({ isOpen: false, type: "CONTRIBUTION" });

  const fund = currentFlatId ? getFundByFlatId(currentFlatId) : undefined;
  const transactions = currentFlatId
    ? getTransactionsByFlatId(currentFlatId)
    : [];

  const flatMembers = useMemo(() => {
    if (!currentFlatId) return [];
    return members.filter((m) => m.flatId === currentFlatId);
  }, [members, currentFlatId]);

  const getMemberName = (memberId: string) => {
    const member = flatMembers.find((m) => m.id === memberId);
    return member
      ? `${member.emoji || ""} ${member.name}`.trim()
      : `Member ${memberId.slice(-4)}`;
  };

  const totalContributions = useMemo(() => {
    return transactions
      .filter((t) => t.type === "CONTRIBUTION")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalWithdrawals = useMemo(() => {
    return transactions
      .filter((t) => t.type === "WITHDRAWAL")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  return (
    <>
      <PageHeader
        title="Emergency Fund"
        subtitle="Shared fund for repairs, deposits, and emergencies"
      />

      {!fund || transactions.length === 0 ? (
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
                }).format(fund.balance)}
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
                  disabled={fund.balance === 0}
                >
                  Record Withdrawal
                </Button>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Transaction History</h2>
              {transactions.length === 0 ? (
                <p className="text-base-content/60 text-center py-4">
                  No transactions yet
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
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
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
    </>
  );
}

