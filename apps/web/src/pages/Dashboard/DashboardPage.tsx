import { useMemo } from "react";
import { StatCard, NoFlatBanner, BalanceBreakdown } from "../../components/common";
import { PageHeader } from "../../components/common/PageHeader";
import { calculateMemberBalances } from "../../lib/balanceCalculations";
import {
  useBills,
  useExpenses,
  useMembers,
  useCurrentUser,
  useSettlements,
  useFlat,
  useBillPayments,
  useNotificationSettings,
} from "../../hooks";
import { getNextDueDate, formatDueDate, getDaysUntilDue } from "../../lib/billUtils";
import { checkAndShowBillReminders } from "../../lib/notifications";
import { useEffect, useRef } from "react";

export default function DashboardPage() {
  const { bills, getActiveBills, getBillsByFlatId } = useBills();
  const { expenses, getExpensesByFlatId } = useExpenses();
  const { members, getActiveMembers } = useMembers();
  const { currentMemberId } = useCurrentUser();
  const { getSettlementsByFlatId } = useSettlements();
  const { getCurrentFlatId } = useFlat();
  const { getLatestPaymentForBill, getPaymentsByBillId, payments: billPayments } = useBillPayments();
  const { enabled: notificationsEnabled, reminderDays, showNotification, canNotify } =
    useNotificationSettings();
  const currentFlatId = getCurrentFlatId();
  const lastCheckRef = useRef<number>(0);

  // Filter data for current flat
  const flatBills = useMemo(() => {
    if (!currentFlatId) return [];
    return getBillsByFlatId(currentFlatId);
  }, [bills, currentFlatId, getBillsByFlatId]);

  const flatExpenses = useMemo(() => {
    if (!currentFlatId) return [];
    return getExpensesByFlatId(currentFlatId);
  }, [expenses, currentFlatId, getExpensesByFlatId]);

  const flatMembers = useMemo(() => {
    if (!currentFlatId) return [];
    return members.filter((m) => m.flatId === currentFlatId);
  }, [members, currentFlatId]);

  // Get active bills sorted by next due date (for current flat only)
  const activeBills = useMemo(() => {
    return flatBills
      .filter((bill) => bill.isActive)
      .map((bill) => ({
        bill,
        nextDueDate: getNextDueDate(bill),
        daysUntilDue: getDaysUntilDue(bill),
      }))
      .sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime())
      .map((item) => item.bill);
  }, [flatBills]);

  // Check for bill reminders periodically (every 5 minutes)
  useEffect(() => {
    if (!notificationsEnabled || !canNotify || activeBills.length === 0) {
      return;
    }

    const checkReminders = () => {
      const now = Date.now();
      // Only check once per minute to avoid spam
      if (now - lastCheckRef.current < 60000) {
        return;
      }
      lastCheckRef.current = now;

      checkAndShowBillReminders(activeBills, showNotification, reminderDays);
    };

    // Check immediately on mount
    checkReminders();

    // Then check every 5 minutes
    const interval = setInterval(checkReminders, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [notificationsEnabled, canNotify, activeBills, reminderDays, showNotification]);

  // Get next bill due (first active bill)
  const nextBillDue = activeBills[0];
  const nextBillDueDate = nextBillDue ? getNextDueDate(nextBillDue) : null;
  const daysUntilNextDue = nextBillDue ? getDaysUntilDue(nextBillDue) : null;

  // Calculate this month's expenses total (for current flat only)
  const thisMonthTotal = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    
    return flatExpenses
      .filter((exp) => exp.date >= startOfMonth && exp.date <= endOfMonth)
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [flatExpenses]);

  // Calculate balance with improved logic
  // If no current user is set, skip balance calculations
  const currentUserId = currentMemberId;
  
  const { youOwe, youWillReceive } = useMemo(() => {
    if (!currentUserId || !currentFlatId) {
      return { youOwe: 0, youWillReceive: 0 };
    }

    // Check if current user is part of the flat
    const currentUserMember = flatMembers.find((m) => m.id === currentUserId);
    if (!currentUserMember || !currentUserMember.isActive) {
      return { youOwe: 0, youWillReceive: 0 };
    }

    let owe = 0;
    let receive = 0;

    // Calculate from expenses (for current flat only)
    flatExpenses.forEach((expense) => {
      const participantCount = expense.participantMemberIds.length;
      if (participantCount === 0) return;
      
      const sharePerPerson = expense.amount / participantCount;
      
      if (expense.participantMemberIds.includes(currentUserId)) {
        if (expense.paidByMemberId === currentUserId) {
          // You paid, others owe you
          const othersCount = participantCount - 1;
          receive += sharePerPerson * othersCount;
        } else {
          // Someone else paid, you owe your share
          owe += sharePerPerson;
        }
      }
    });

    // Calculate from active bills (for current flat only)
    // Only count bills that haven't been fully paid
    const activeMembers = flatMembers.filter((m) => m.isActive);
    const participantCount = activeMembers.length;
    
    if (participantCount > 0) {
      activeBills.forEach((bill) => {
        // Get total payments for this bill
        const billPayments = getPaymentsByBillId(bill.id);
        const totalPaid = billPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = Math.max(0, bill.amount - totalPaid);
        
        if (remainingAmount > 0) {
          // Calculate share based on split type
          let sharePerPerson = 0;
          if (bill.splitType === "WEIGHTED") {
            // Weighted split: calculate based on member weights
            const totalWeight = activeMembers.reduce((sum, m) => sum + m.weight, 0);
            if (totalWeight > 0) {
              const currentUserWeight = currentUserMember.weight || 1;
              sharePerPerson = (remainingAmount * currentUserWeight) / totalWeight;
            } else {
              sharePerPerson = remainingAmount / participantCount;
            }
          } else {
            // Equal split
            sharePerPerson = remainingAmount / participantCount;
          }
          
          owe += sharePerPerson;
        }
      });
    }

    // Calculate from settlements (for current flat only)
    const settlements = getSettlementsByFlatId(currentFlatId);
    settlements.forEach((settlement) => {
      if (settlement.fromMemberId === currentUserId) {
        // You paid someone, reduce what you owe
        owe -= settlement.amount;
      }
      if (settlement.toMemberId === currentUserId) {
        // Someone paid you, increase what you'll receive
        receive += settlement.amount;
      }
    });

    return { youOwe: Math.max(0, owe), youWillReceive: Math.max(0, receive) };
  }, [flatExpenses, activeBills, flatMembers, currentUserId, getSettlementsByFlatId, currentFlatId, getPaymentsByBillId]);

  // Calculate detailed balance breakdown (who owes whom)
  const memberBalances = useMemo(() => {
    if (!currentFlatId || flatMembers.length === 0) return [];
    
    const settlements = getSettlementsByFlatId(currentFlatId);
    const flatBillPayments = billPayments.filter((p) => p.flatId === currentFlatId);
    
    return calculateMemberBalances(
      flatExpenses,
      flatBills,
      settlements,
      flatBillPayments,
      flatMembers,
      currentUserId || ""
    );
  }, [flatExpenses, flatBills, flatMembers, currentUserId, getSettlementsByFlatId, currentFlatId, billPayments]);

  // Get recent expenses (last 5, sorted by date) - for current flat only
  const recentExpenses = useMemo(() => {
    return [...flatExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [flatExpenses]);

  // Helper to get member name
  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member ? member.name : `Member ${memberId.slice(-4)}`;
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your flat's shared expenses"
      />

      <NoFlatBanner />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="This month total"
          value={new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(thisMonthTotal)}
          variant="primary"
        />
        <StatCard
          title="You owe"
          value={new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(youOwe)}
          variant="error"
        />
        <StatCard
          title="You will receive"
          value={new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(youWillReceive)}
          variant="success"
        />
        <StatCard
          title="Next bill due"
          value={
            nextBillDue && nextBillDueDate
              ? `${formatDueDate(nextBillDueDate)} - ${nextBillDue.name}`
              : "No bills"
          }
          subtitle={
            nextBillDue
              ? daysUntilNextDue !== null && daysUntilNextDue >= 0
                ? `${daysUntilNextDue} day${daysUntilNextDue !== 1 ? "s" : ""} • ${new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(nextBillDue.amount)}`
                : new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(nextBillDue.amount)
              : undefined
          }
          variant="warning"
        />
      </div>

      {/* Balance Breakdown */}
      {currentUserId && memberBalances.length > 0 && (
        <div className="mb-6">
          <BalanceBreakdown
            balances={memberBalances}
            members={flatMembers}
            currentUserId={currentUserId}
          />
        </div>
      )}

      {/* Two columns: Upcoming Bills & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bills */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Upcoming Bills</h2>
            {activeBills.length === 0 ? (
              <p className="text-base-content/60 text-sm">No upcoming bills</p>
            ) : (
              <div className="space-y-3">
                {activeBills.slice(0, 5).map((bill) => {
                  const nextDue = getNextDueDate(bill);
                  const daysUntil = getDaysUntilDue(bill);
                  const latestPayment = getLatestPaymentForBill(bill.id);
                  return (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
                    >
                      <div>
                        <p className="font-semibold">{bill.name}</p>
                        <p className="text-sm text-base-content/60">
                          Due {formatDueDate(nextDue)}
                          {daysUntil >= 0 && ` (${daysUntil} day${daysUntil !== 1 ? "s" : ""})`}
                          {latestPayment && (
                            <span className="ml-2 text-success">
                              • Last paid {formatDueDate(new Date(latestPayment.paidDate))}
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="font-bold">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(bill.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Recent Expenses</h2>
            {recentExpenses.length === 0 ? (
              <p className="text-base-content/60 text-sm">
                No recent expenses
              </p>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{expense.description}</p>
                      <p className="text-sm text-base-content/60">
                        {new Date(expense.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        • Paid by {getMemberName(expense.paidByMemberId)}
                      </p>
                    </div>
                    <p className="font-bold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(expense.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

