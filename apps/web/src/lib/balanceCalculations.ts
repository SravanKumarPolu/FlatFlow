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

/**
 * Simplified debt representation (A owes B ₹X)
 * This simplifies the debt network to show minimal transactions
 * Similar to Splitwise's debt simplification
 */
export interface SimplifiedDebt {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
}

/**
 * Simplify debts to show minimal transactions
 * Uses a greedy algorithm to minimize the number of transactions
 */
export function simplifyDebts(memberBalances: MemberBalance[]): SimplifiedDebt[] {
  // Filter to only members with non-zero net balances
  const relevantBalances = memberBalances.filter(
    (b) => Math.abs(b.netBalance) > 0.01
  );

  if (relevantBalances.length === 0) {
    return [];
  }

  // Separate creditors (positive net balance) and debtors (negative net balance)
  const creditors: MemberBalance[] = [];
  const debtors: MemberBalance[] = [];

  relevantBalances.forEach((balance) => {
    if (balance.netBalance > 0.01) {
      creditors.push(balance);
    } else if (balance.netBalance < -0.01) {
      debtors.push({ ...balance, netBalance: Math.abs(balance.netBalance) });
    }
  });

  // Sort: creditors by amount (descending), debtors by amount (descending)
  creditors.sort((a, b) => b.netBalance - a.netBalance);
  debtors.sort((a, b) => b.netBalance - a.netBalance);

  const simplifiedDebts: SimplifiedDebt[] = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  // Greedy matching: match largest creditor with largest debtor
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const amount = Math.min(creditor.netBalance, debtor.netBalance);

    simplifiedDebts.push({
      fromMemberId: debtor.memberId,
      fromMemberName: debtor.memberName,
      toMemberId: creditor.memberId,
      toMemberName: creditor.memberName,
      amount: amount,
    });

    // Update remaining balances
    creditor.netBalance -= amount;
    debtor.netBalance -= amount;

    // Move to next if balance is settled (within rounding tolerance)
    if (creditor.netBalance < 0.01) {
      creditorIndex++;
    }
    if (debtor.netBalance < 0.01) {
      debtorIndex++;
    }
  }

  return simplifiedDebts;
}

