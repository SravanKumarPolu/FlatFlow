import { Expense, Bill, Settlement, Member, BillPayment } from "@flatflow/core";

export interface MemberBalance {
  memberId: string;
  memberName: string;
  owes: number; // Amount this member owes to others
  receives: number; // Amount others owe to this member
  netBalance: number; // receives - owes (positive = they owe you, negative = you owe them)
}

/**
 * Calculate detailed balance breakdown: who owes whom
 */
export function calculateMemberBalances(
  expenses: Expense[],
  bills: Bill[],
  settlements: Settlement[],
  billPayments: BillPayment[],
  members: Member[],
  _currentUserId: string
): MemberBalance[] {
  const balances: Map<string, MemberBalance> = new Map();

  // Initialize balances for all members
  members.forEach((member) => {
    balances.set(member.id, {
      memberId: member.id,
      memberName: member.name,
      owes: 0,
      receives: 0,
      netBalance: 0,
    });
  });

  // Calculate from expenses
  expenses.forEach((expense) => {
    const participantCount = expense.participantMemberIds.length;
    if (participantCount === 0) return;

    const sharePerPerson = expense.amount / participantCount;
    const payerId = expense.paidByMemberId;

    expense.participantMemberIds.forEach((participantId) => {
      if (participantId === payerId) {
        // Payer should receive from others
        const balance = balances.get(payerId);
        if (balance) {
          balance.receives += sharePerPerson * (participantCount - 1);
        }
      } else {
        // Participant owes their share to the payer
        const balance = balances.get(participantId);
        if (balance) {
          balance.owes += sharePerPerson;
        }
        // Payer receives from this participant
        const payerBalance = balances.get(payerId);
        if (payerBalance) {
          payerBalance.receives += sharePerPerson;
        }
      }
    });
  });

  // Calculate from bills (only unpaid portion)
  const activeMembers = members.filter((m) => m.isActive);
  const participantCount = activeMembers.length;

  if (participantCount > 0) {
    bills
      .filter((bill) => bill.isActive)
      .forEach((bill) => {
        // Get total payments for this bill
        const payments = billPayments.filter((p) => p.billId === bill.id);
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const remainingAmount = Math.max(0, bill.amount - totalPaid);

        if (remainingAmount > 0) {
          let sharePerPerson = 0;
          if (bill.splitType === "WEIGHTED") {
            // For weighted, we'll calculate per member
            const totalWeight = activeMembers.reduce((sum, m) => sum + m.weight, 0);
            if (totalWeight > 0) {
              activeMembers.forEach((member) => {
                const memberShare = (remainingAmount * member.weight) / totalWeight;
                const balance = balances.get(member.id);
                if (balance) {
                  balance.owes += memberShare;
                }
              });
            }
          } else {
            // Equal split
            sharePerPerson = remainingAmount / participantCount;
            activeMembers.forEach((member) => {
              const balance = balances.get(member.id);
              if (balance) {
                balance.owes += sharePerPerson;
              }
            });
          }
        }
      });
  }

  // Apply settlements
  settlements.forEach((settlement) => {
    const fromBalance = balances.get(settlement.fromMemberId);
    const toBalance = balances.get(settlement.toMemberId);

    if (fromBalance) {
      // Person who paid reduces what they owe
      fromBalance.owes = Math.max(0, fromBalance.owes - settlement.amount);
    }
    if (toBalance) {
      // Person who received increases what they'll receive
      toBalance.receives += settlement.amount;
    }
  });

  // Calculate net balance for each member
  balances.forEach((balance) => {
    balance.netBalance = balance.receives - balance.owes;
  });

  // Return sorted by net balance (those who owe most first)
  return Array.from(balances.values()).sort((a, b) => a.netBalance - b.netBalance);
}

/**
 * Get balance summary for current user
 */
export function getCurrentUserBalance(
  memberBalances: MemberBalance[],
  currentUserId: string
): { owes: number; receives: number; netBalance: number } | null {
  const userBalance = memberBalances.find((b) => b.memberId === currentUserId);
  if (!userBalance) return null;

  return {
    owes: userBalance.owes,
    receives: userBalance.receives,
    netBalance: userBalance.netBalance,
  };
}

