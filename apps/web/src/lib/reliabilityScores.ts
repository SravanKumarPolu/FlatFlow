import { Member, Expense, BillPayment, Settlement } from "@flatflow/core";

export interface MemberReliabilityScore {
  memberId: string;
  memberName: string;
  score: number; // 0-100
  status: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  totalPaid: number;
  totalOwed: number;
  onTimePayments: number;
  latePayments: number;
  averageDelayDays: number;
}

/**
 * Calculate reliability scores for all members based on payment history
 */
export function calculateReliabilityScores(
  members: Member[],
  expenses: Expense[],
  billPayments: BillPayment[],
  settlements: Settlement[],
  flatId: string
): MemberReliabilityScore[] {
  const scores: Map<string, MemberReliabilityScore> = new Map();

  // Initialize scores for all active members
  members
    .filter((m) => m.flatId === flatId && m.isActive)
    .forEach((member) => {
      scores.set(member.id, {
        memberId: member.id,
        memberName: member.name,
        score: 100, // Start with perfect score
        status: "EXCELLENT",
        totalPaid: 0,
        totalOwed: 0,
        onTimePayments: 0,
        latePayments: 0,
        averageDelayDays: 0,
      });
    });

  // Calculate from expenses (simplified: assume paid on time if within 7 days of expense date)
  expenses.forEach((expense) => {
    const payer = scores.get(expense.paidByMemberId);
    if (payer) {
      payer.totalPaid += expense.amount;
      // For expenses, assume paid on time (they paid immediately)
      payer.onTimePayments += 1;
    }

    // Calculate what each participant owes
    const sharePerPerson = expense.amount / expense.participantMemberIds.length;
    expense.participantMemberIds.forEach((participantId) => {
      if (participantId !== expense.paidByMemberId) {
        const participant = scores.get(participantId);
        if (participant) {
          participant.totalOwed += sharePerPerson;
        }
      }
    });
  });

  // Calculate from bill payments (check if paid on time based on due date)
  billPayments.forEach((payment) => {
    const payer = scores.get(payment.paidByMemberId);
    if (payer) {
      payer.totalPaid += payment.amount;
      // Simplified: assume on time if paid within 3 days of due date
      // In real implementation, would check against bill due date
      payer.onTimePayments += 1;
    }
  });

  // Calculate from settlements (late payments reduce score)
  settlements.forEach((settlement) => {
    const payer = scores.get(settlement.fromMemberId);
    if (payer) {
      // Settlement indicates a late payment was made
      payer.latePayments += 1;
      payer.onTimePayments = Math.max(0, payer.onTimePayments - 1);
    }
  });

  // Calculate final scores
  scores.forEach((score) => {
    const totalPayments = score.onTimePayments + score.latePayments;
    if (totalPayments > 0) {
      const onTimeRate = score.onTimePayments / totalPayments;
      score.score = Math.round(onTimeRate * 100);

      // Adjust score based on payment ratio (paid vs owed)
      const paymentRatio = score.totalOwed > 0 ? score.totalPaid / score.totalOwed : 1;
      score.score = Math.round(score.score * Math.min(paymentRatio, 1.2)); // Cap at 120% for over-payers

      // Determine status
      if (score.score >= 90) {
        score.status = "EXCELLENT";
      } else if (score.score >= 75) {
        score.status = "GOOD";
      } else if (score.score >= 60) {
        score.status = "FAIR";
      } else {
        score.status = "POOR";
      }
    } else {
      // No payment history, neutral score
      score.score = 75;
      score.status = "FAIR";
    }
  });

  return Array.from(scores.values()).sort((a, b) => b.score - a.score);
}

/**
 * Get status color for reliability score
 */
export function getReliabilityStatusColor(
  status: MemberReliabilityScore["status"]
): string {
  switch (status) {
    case "EXCELLENT":
      return "text-success";
    case "GOOD":
      return "text-primary";
    case "FAIR":
      return "text-warning";
    case "POOR":
      return "text-error";
    default:
      return "text-base-content";
  }
}

/**
 * Get status badge class
 */
export function getReliabilityStatusBadge(
  status: MemberReliabilityScore["status"]
): string {
  switch (status) {
    case "EXCELLENT":
      return "badge-success";
    case "GOOD":
      return "badge-primary";
    case "FAIR":
      return "badge-warning";
    case "POOR":
      return "badge-error";
    default:
      return "badge-neutral";
  }
}

