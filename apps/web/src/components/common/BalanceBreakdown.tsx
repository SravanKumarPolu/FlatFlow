import { Card } from "@flatflow/ui";
import { Member } from "@flatflow/core";
import { MemberBalance } from "../../lib/balanceCalculations";

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
        <h2 className="card-title text-lg mb-4">Who Owes Whom</h2>
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
      </div>
    </Card>
  );
}

