import { Member, Expense, BillPayment, Settlement, Bill } from "@flatflow/core";
import { getNextDueDate } from "./billUtils";

export interface PaymentRecord {
  type: "EXPENSE" | "BILL_PAYMENT" | "SETTLEMENT";
  amount: number;
  date: Date;
  dueDate?: Date;
  delayDays?: number;
  isOnTime: boolean;
  description: string;
}

export interface MemberReliabilityScore {
  memberId: string;
  memberName: string;
  score: number; // 0-100
  status: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  totalPaid: number;
  totalOwed: number;
  onTimePayments: number;
  latePayments: number;
  missedPayments: number;
  averageDelayDays: number;
  longestOnTimeStreak: number;
  recentIssues: string[]; // Reasons affecting the score
  healthIndicator: "ALWAYS_ON_TIME" | "MOSTLY_ON_TIME" | "SOMETIMES_LATE" | "OFTEN_LATE" | "UNRELIABLE";
  paymentHistory: PaymentRecord[]; // Payment history for detail view
  monthlyBehavior: Record<string, { onTime: number; late: number; total: number }>; // Last N months
}

/**
 * Calculate the due date for a bill payment based on the bill's dueDay
 */
function calculateBillDueDate(bill: Bill, paymentDate: Date): Date {
  const paymentYear = paymentDate.getFullYear();
  const paymentMonth = paymentDate.getMonth();
  const dueDay = Math.max(1, Math.min(31, bill.dueDay || 1));
  
  // Find the due date for the month of payment
  return new Date(paymentYear, paymentMonth, dueDay);
}

/**
 * Calculate reliability scores for all members based on payment history
 */
export function calculateReliabilityScores(
  members: Member[],
  expenses: Expense[],
  billPayments: BillPayment[],
  settlements: Settlement[],
  bills: Bill[],
  flatId: string
): MemberReliabilityScore[] {
  const scores: Map<string, MemberReliabilityScore> = new Map();
  const paymentHistory: Map<string, PaymentRecord[]> = new Map();

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
        missedPayments: 0,
        averageDelayDays: 0,
        longestOnTimeStreak: 0,
        recentIssues: [],
        healthIndicator: "ALWAYS_ON_TIME",
        paymentHistory: [],
        monthlyBehavior: {},
      });
      paymentHistory.set(member.id, []);
    });

  // Process expenses (paid immediately, so always on time)
  expenses.forEach((expense) => {
    const payer = scores.get(expense.paidByMemberId);
    if (payer) {
      payer.totalPaid += expense.amount;
      payer.onTimePayments += 1;
      
      paymentHistory.get(expense.paidByMemberId)?.push({
        type: "EXPENSE",
        amount: expense.amount,
        date: new Date(expense.date),
        isOnTime: true,
        description: expense.description,
      });
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

  // Process bill payments (check against actual due dates)
  billPayments.forEach((payment) => {
    const payer = scores.get(payment.paidByMemberId);
    if (!payer) return;

    const bill = bills.find((b) => b.id === payment.billId);
    if (!bill) return;

    const paidDate = new Date(payment.paidDate);
    const dueDate = calculateBillDueDate(bill, paidDate);
    const delayDays = Math.max(0, Math.ceil((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

    payer.totalPaid += payment.amount;
    
    if (delayDays === 0 || delayDays <= 3) {
      // On time (within 3 days grace period)
      payer.onTimePayments += 1;
      paymentHistory.get(payment.paidByMemberId)?.push({
        type: "BILL_PAYMENT",
        amount: payment.amount,
        date: paidDate,
        dueDate,
        delayDays: delayDays === 0 ? 0 : delayDays,
        isOnTime: true,
        description: bill.name,
      });
    } else {
      // Late payment
      payer.latePayments += 1;
      paymentHistory.get(payment.paidByMemberId)?.push({
        type: "BILL_PAYMENT",
        amount: payment.amount,
        date: paidDate,
        dueDate,
        delayDays,
        isOnTime: false,
        description: bill.name,
      });
    }
  });

  // Process settlements (indicate late payments)
  settlements.forEach((settlement) => {
    const payer = scores.get(settlement.fromMemberId);
    if (payer) {
      payer.latePayments += 1;
      payer.onTimePayments = Math.max(0, payer.onTimePayments - 1);
      
      paymentHistory.get(settlement.fromMemberId)?.push({
        type: "SETTLEMENT",
        amount: settlement.amount,
        date: new Date(settlement.date),
        isOnTime: false,
        description: `Settlement to ${settlement.toMemberId.slice(-4)}`,
      });
    }
  });

  // Detect missed payments (unpaid bills that are past due)
  // A bill is considered missed if:
  // 1. It's active
  // 2. Total payments < bill amount
  // 3. The due date has passed (more than 7 days ago to account for grace period)
  const now = new Date();
  const activeMembers = members.filter((m) => m.flatId === flatId && m.isActive);
  const memberCount = activeMembers.length;

  bills
    .filter((bill) => bill.isActive && bill.flatId === flatId)
    .forEach((bill) => {
      const billPaymentsForBill = billPayments.filter((p) => p.billId === bill.id);
      const totalPaid = billPaymentsForBill.reduce((sum, p) => sum + p.amount, 0);
      const remainingAmount = bill.amount - totalPaid;

      if (remainingAmount > 0) {
        // Calculate the last due date that has passed for this bill
        // getNextDueDate returns the next due date, so we need to go back one month
        const nextDueDate = getNextDueDate(bill);
        const lastDueDate = new Date(nextDueDate);
        lastDueDate.setMonth(lastDueDate.getMonth() - 1);
        
        const daysPastDue = Math.ceil((now.getTime() - lastDueDate.getTime()) / (1000 * 60 * 60 * 24));

        // If bill is more than 7 days past due and not fully paid, it's a missed payment
        if (daysPastDue > 7) {
          // Calculate each member's share of the missed payment
          const sharePerPerson = bill.splitType === "WEIGHTED"
            ? (() => {
                const totalWeight = activeMembers.reduce((sum, m) => sum + m.weight, 0);
                return totalWeight > 0 ? remainingAmount / totalWeight : remainingAmount / memberCount;
              })()
            : remainingAmount / memberCount;

          activeMembers.forEach((member) => {
            const memberShare = bill.splitType === "WEIGHTED"
              ? (remainingAmount * member.weight) / activeMembers.reduce((sum, m) => sum + m.weight, 0)
              : sharePerPerson;

            const score = scores.get(member.id);
            if (score) {
              score.missedPayments += 1;
              score.totalOwed += memberShare;

              // Add to payment history as a missed payment
              paymentHistory.get(member.id)?.push({
                type: "BILL_PAYMENT",
                amount: memberShare,
                date: lastDueDate,
                dueDate: lastDueDate,
                delayDays: daysPastDue,
                isOnTime: false,
                description: `${bill.name} (unpaid)`,
              });
            }
          });
        }
      }
    });

  // Calculate monthly behavior summary (last 6 months)
  const monthlyBehavior: Map<string, Record<string, { onTime: number; late: number; total: number }>> = new Map();
  
  paymentHistory.forEach((payments, memberId) => {
    const behavior: Record<string, { onTime: number; late: number; total: number }> = {};
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      behavior[monthKey] = { onTime: 0, late: 0, total: 0 };
    }
    
    payments.forEach((payment) => {
      const paymentDate = payment.date;
      const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, "0")}`;
      if (behavior[monthKey]) {
        behavior[monthKey].total += 1;
        if (payment.isOnTime) {
          behavior[monthKey].onTime += 1;
        } else {
          behavior[monthKey].late += 1;
        }
      }
    });
    
    monthlyBehavior.set(memberId, behavior);
  });

  /**
   * Calculate final reliability scores using a deterministic algorithm.
   * 
   * Scoring Formula (starts from 100, subtracts penalties):
   * 1. Base Score (0-70 points): Based on on-time payment rate
   *    - onTimeRate * 70
   * 
   * 2. Late Payment Penalty (up to -20 points):
   *    - lateRate * min(20, averageDelayDays * 0.5)
   * 
   * 3. Missed Payment Penalty (up to -10 points):
   *    - min(10, missedPayments * 2)
   * 
   * 4. On-Time Streak Bonus (up to +10 points):
   *    - min(10, (longestStreak - 5) * 1) if streak >= 6
   * 
   * 5. Payment Ratio Adjustment (up to ±10 points):
   *    - +10 if paid >= owed, -10 if paid < owed
   * 
   * Final score is clamped to 0-100 range.
   */
  scores.forEach((score, memberId) => {
    const payments = paymentHistory.get(memberId) || [];
    const totalPayments = score.onTimePayments + score.latePayments + score.missedPayments;
    
    // Add payment history and monthly behavior to score
    score.paymentHistory = [...payments].sort((a, b) => b.date.getTime() - a.date.getTime());
    score.monthlyBehavior = monthlyBehavior.get(memberId) || {};

    if (totalPayments === 0) {
      // No payment history, neutral score
      score.score = 75;
      score.status = "FAIR";
      score.healthIndicator = "MOSTLY_ON_TIME";
      score.paymentHistory = [];
      score.monthlyBehavior = {};
      return;
    }

    // Step 1: Base score from on-time rate (0-70 points)
    const onTimeRate = totalPayments > 0 ? score.onTimePayments / totalPayments : 0;
    let finalScore = onTimeRate * 70;

    // Calculate average delay days for late payments
    const latePayments = payments.filter((p) => !p.isOnTime && p.delayDays);
    if (latePayments.length > 0) {
      score.averageDelayDays = Math.round(
        latePayments.reduce((sum, p) => sum + (p.delayDays || 0), 0) / latePayments.length
      );
    }

    // Step 2: Penalties for late payments (subtract up to 20 points)
    if (score.latePayments > 0 && totalPayments > 0) {
      const lateRate = score.latePayments / totalPayments;
      const delayPenalty = Math.min(20, score.averageDelayDays * 0.5);
      finalScore -= lateRate * delayPenalty;
    }

    // Step 3: Penalty for missed payments (subtract up to 10 points)
    if (score.missedPayments > 0) {
      finalScore -= Math.min(10, score.missedPayments * 2);
    }

    // Step 4: Bonus for long on-time streaks (add up to 10 points)
    let currentStreak = 0;
    let longestStreak = 0;
    const sortedPayments = [...payments].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    sortedPayments.forEach((payment) => {
      if (payment.isOnTime) {
        currentStreak += 1;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    score.longestOnTimeStreak = longestStreak;
    if (longestStreak >= 6) {
      finalScore += Math.min(10, (longestStreak - 5) * 1);
    }

    // Step 5: Adjust based on payment ratio (paid vs owed) - up to ±10 points
    const paymentRatio = score.totalOwed > 0 ? score.totalPaid / score.totalOwed : 1;
    if (paymentRatio >= 1) {
      // Paid more than owed - bonus
      finalScore += Math.min(10, (paymentRatio - 1) * 10);
    } else {
      // Paid less than owed - penalty
      finalScore -= (1 - paymentRatio) * 10;
    }

    // Clamp final score to 0-100 range
    finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

    // Determine status
    if (finalScore >= 90) {
      score.status = "EXCELLENT";
      score.healthIndicator = "ALWAYS_ON_TIME";
    } else if (finalScore >= 75) {
      score.status = "GOOD";
      // For Good status, use "Mostly on time" if there are some late payments, otherwise "Always on time"
      const lateRate = score.latePayments / totalPayments;
      score.healthIndicator = lateRate <= 0.1 ? "ALWAYS_ON_TIME" : "MOSTLY_ON_TIME";
    } else if (finalScore >= 60) {
      score.status = "FAIR";
      score.healthIndicator = "SOMETIMES_LATE";
    } else {
      score.status = "POOR";
      score.healthIndicator = score.latePayments > totalPayments * 0.5 ? "UNRELIABLE" : "OFTEN_LATE";
    }

    // Generate recent issues
    const recentPayments = sortedPayments.slice(-6); // Last 6 payments
    const recentLate = recentPayments.filter((p) => !p.isOnTime).length;
    
    if (recentLate >= 3) {
      score.recentIssues.push(`${recentLate} late payments in last 6 transactions`);
    }
    if (score.averageDelayDays > 7) {
      score.recentIssues.push(`Average delay of ${score.averageDelayDays} days`);
    }
    if (score.missedPayments > 0) {
      score.recentIssues.push(`${score.missedPayments} missed payment(s)`);
    }
    if (paymentRatio < 0.8) {
      score.recentIssues.push(`Only paid ${Math.round(paymentRatio * 100)}% of owed amount`);
    }
    if (score.longestOnTimeStreak >= 6) {
      score.recentIssues.push(`Long streak: ${score.longestOnTimeStreak} on-time payments`);
    }

    score.score = finalScore;
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

/**
 * Get health indicator text
 */
export function getHealthIndicatorText(
  indicator: MemberReliabilityScore["healthIndicator"]
): string {
  switch (indicator) {
    case "ALWAYS_ON_TIME":
      return "Always on time";
    case "MOSTLY_ON_TIME":
      return "Mostly on time";
    case "SOMETIMES_LATE":
      return "Sometimes late";
    case "OFTEN_LATE":
      return "Frequently late";
    case "UNRELIABLE":
      return "Unreliable";
    default:
      return "Unknown";
  }
}

/**
 * Get health indicator icon
 */
export function getHealthIndicatorIcon(
  indicator: MemberReliabilityScore["healthIndicator"]
): string {
  switch (indicator) {
    case "ALWAYS_ON_TIME":
      return "✅";
    case "MOSTLY_ON_TIME":
      return "👍";
    case "SOMETIMES_LATE":
      return "⚠️";
    case "OFTEN_LATE":
      return "🔴";
    case "UNRELIABLE":
      return "❌";
    default:
      return "❓";
  }
}
