import { useState } from "react";
import { Card } from "@flatflow/ui";
import { Member } from "@flatflow/core";
import { MemberBalance, simplifyDebts } from "../../lib/balanceCalculations";

interface BalanceBreakdownProps {
  balances: MemberBalance[];
  members: Member[];
  currentUserId: string | null;
}

export function BalanceBreakdown({
  balances,
  members,
  currentUserId,
}: BalanceBreakdownProps) {
  const [showSimplified, setShowSimplified] = useState(false);

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member
      ? `${member.emoji || ""} ${member.name}`.trim()
      : `Member ${memberId.slice(-4)}`;
  };

  // Filter out members with zero balance
  const relevantBalances = balances.filter(
    (b) => Math.abs(b.netBalance) > 0.01 || b.owes > 0 || b.receives > 0
  );

  // Get simplified debts
  const simplifiedDebts = simplifyDebts(balances);

  if (relevantBalances.length === 0) {
    return (
      <Card variant="bordered">
        <div className="card-body">
          <p className="text-base-content/60 text-center">All balances are settled! 🎉</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="bordered">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title text-lg">Who Owes Whom</h2>
          {simplifiedDebts.length > 0 && (
            <div className="form-control">
              <label className="label cursor-pointer gap-2">
                <span className="label-text text-sm">Simplified View</span>
                <input
                  type="checkbox"
                  className="toggle toggle-sm toggle-primary"
                  checked={showSimplified}
                  onChange={(e) => setShowSimplified(e.target.checked)}
                />
              </label>
            </div>
          )}
        </div>

        {showSimplified && simplifiedDebts.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-base-content/60 mb-2">
              Simplified to {simplifiedDebts.length} transaction{simplifiedDebts.length !== 1 ? "s" : ""}:
            </p>
            {simplifiedDebts.map((debt, index) => {
              const fromIsCurrentUser = debt.fromMemberId === currentUserId;
              const toIsCurrentUser = debt.toMemberId === currentUserId;
              return (
                <div
                  key={`${debt.fromMemberId}-${debt.toMemberId}-${index}`}
                  className={`p-3 rounded-lg border ${
                    fromIsCurrentUser || toIsCurrentUser
                      ? "bg-primary/10 border-primary"
                      : "bg-base-200 border-base-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-semibold">
                        {getMemberName(debt.fromMemberId)}
                      </span>
                      {fromIsCurrentUser && (
                        <span className="badge badge-primary badge-sm">You</span>
                      )}
                      <span className="text-base-content/60">→</span>
                      <span className="font-semibold">
                        {getMemberName(debt.toMemberId)}
                      </span>
                      {toIsCurrentUser && (
                        <span className="badge badge-primary badge-sm">You</span>
                      )}
                    </div>
                    <span className="text-error font-bold text-lg">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(debt.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {relevantBalances.map((balance) => {
              const isCurrentUser = balance.memberId === currentUserId;
              return (
                <div
                  key={balance.memberId}
                  className={`p-3 rounded-lg border ${
                    isCurrentUser
                      ? "bg-primary/10 border-primary"
                      : "bg-base-200 border-base-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{getMemberName(balance.memberId)}</span>
                      {isCurrentUser && (
                        <span className="badge badge-primary badge-sm">You</span>
                      )}
                    </div>
                    <div className="text-right">
                      {balance.netBalance > 0.01 ? (
                        <span className="text-success font-bold">
                          +{new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(balance.netBalance)}
                        </span>
                      ) : balance.netBalance < -0.01 ? (
                        <span className="text-error font-bold">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(balance.netBalance)}
                        </span>
                      ) : (
                        <span className="text-base-content/60 font-medium">Settled</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-base-content/60 space-y-1">
                    {balance.owes > 0 && (
                      <p>
                        Owes:{" "}
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(balance.owes)}
                      </p>
                    )}
                    {balance.receives > 0 && (
                      <p>
                        Will receive:{" "}
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(balance.receives)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

