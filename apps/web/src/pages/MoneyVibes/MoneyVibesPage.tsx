import { useState, useMemo } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { NoFlatBanner } from "../../components/common/NoFlatBanner";
import { useExpenses, useMembers, useFlat, useBillPayments, useSettlements, useBills } from "../../hooks";
import {
  calculateReliabilityScores,
  getReliabilityStatusBadge,
  getReliabilityStatusColor,
  getHealthIndicatorText,
  getHealthIndicatorIcon,
  type MemberReliabilityScore,
} from "../../lib/reliabilityScores";
import { Button } from "@flatflow/ui";

interface MemberDetailModalProps {
  score: MemberReliabilityScore;
  isOpen: boolean;
  onClose: () => void;
}

function MemberDetailModal({ score, isOpen, onClose }: MemberDetailModalProps) {
  if (!isOpen) return null;

  // Get monthly behavior summary (last 6 months)
  const monthlyBehaviorEntries = Object.entries(score.monthlyBehavior || {})
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6);

  return (
    <>
      <input
        type="checkbox"
        id="member-detail-modal"
        className="modal-toggle"
        checked={isOpen}
        onChange={() => {}}
      />
      <div className="modal" role="dialog">
        <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
          <h3 className="font-bold text-lg mb-4">{score.memberName}'s Payment History</h3>

          <div className="space-y-4">
            {/* Score Summary */}
            <div className="stats stats-horizontal shadow-sm w-full">
              <div className="stat">
                <div className="stat-title">Reliability Score</div>
                <div className={`stat-value ${getReliabilityStatusColor(score.status)}`}>
                  {score.score}
                </div>
                <div className="stat-desc">
                  <span className={`badge ${getReliabilityStatusBadge(score.status)}`}>
                    {score.status}
                  </span>
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">On Time</div>
                <div className="stat-value text-success">{score.onTimePayments}</div>
                <div className="stat-desc">Payments</div>
              </div>
              <div className="stat">
                <div className="stat-title">Late</div>
                <div className="stat-value text-error">{score.latePayments}</div>
                <div className="stat-desc">Payments</div>
              </div>
              <div className="stat">
                <div className="stat-title">Longest Streak</div>
                <div className="stat-value text-primary">{score.longestOnTimeStreak}</div>
                <div className="stat-desc">On-time payments</div>
              </div>
            </div>

            {/* Score Explanation */}
            <div className="alert alert-info">
              <div>
                <h4 className="font-bold">Score Explanation</h4>
                <div className="text-sm mt-2 space-y-1">
                  {score.onTimePayments > 0 && (
                    <div>✓ {score.onTimePayments} on-time payment{score.onTimePayments !== 1 ? "s" : ""}</div>
                  )}
                  {score.latePayments > 0 && (
                    <div className="text-warning">
                      ⚠ {score.latePayments} late payment{score.latePayments !== 1 ? "s" : ""}
                      {score.averageDelayDays > 0 && ` (avg ${score.averageDelayDays} days late)`}
                    </div>
                  )}
                  {score.missedPayments > 0 && (
                    <div className="text-error">
                      ✗ {score.missedPayments} missed payment{score.missedPayments !== 1 ? "s" : ""}
                    </div>
                  )}
                  {score.longestOnTimeStreak > 0 && (
                    <div className="text-success">
                      🎯 Longest streak: {score.longestOnTimeStreak} consecutive on-time payments
                    </div>
                  )}
                  {score.recentIssues.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-base-300">
                      <div className="font-semibold mb-1">Additional Notes:</div>
                      <ul className="list-disc list-inside">
                        {score.recentIssues.map((issue, idx) => (
                          <li key={idx} className="text-xs">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title">Total Paid</div>
                <div className="stat-value text-lg text-success">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(score.totalPaid)}
                </div>
              </div>
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title">Total Owed</div>
                <div className="stat-value text-lg">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(score.totalOwed)}
                </div>
              </div>
            </div>

            {score.averageDelayDays > 0 && (
              <div className="alert alert-warning">
                <div>
                  <div className="font-bold">Average Delay</div>
                  <div className="text-sm">{score.averageDelayDays} days</div>
                </div>
              </div>
            )}

            {/* Last 6 Months Behavior Summary */}
            {monthlyBehaviorEntries.length > 0 && (
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body">
                  <h4 className="font-bold text-lg mb-3">Last 6 Months' Behavior</h4>
                  <div className="space-y-2">
                    {monthlyBehaviorEntries.map(([monthKey, behavior]) => {
                      const [year, month] = monthKey.split("-");
                      const monthName = new Date(
                        parseInt(year),
                        parseInt(month) - 1
                      ).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
                      const onTimeRate =
                        behavior.total > 0
                          ? (behavior.onTime / behavior.total) * 100
                          : 0;

                      return (
                        <div key={monthKey} className="flex items-center justify-between p-2 bg-base-100 rounded">
                          <div className="flex-1">
                            <div className="font-semibold">{monthName}</div>
                            <div className="text-xs text-base-content/60">
                              {behavior.onTime} on-time, {behavior.late} late ({behavior.total} total)
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {onTimeRate.toFixed(0)}%
                            </div>
                            <div className="text-xs text-base-content/60">On-time rate</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Payment History Timeline */}
            {score.paymentHistory && score.paymentHistory.length > 0 && (
              <div className="card bg-base-200 shadow-sm">
                <div className="card-body">
                  <h4 className="font-bold text-lg mb-3">Payment History Timeline</h4>
                  <div className="overflow-x-auto">
                    <table className="table w-full table-sm">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {score.paymentHistory.slice(0, 20).map((payment, idx) => (
                          <tr key={idx}>
                            <td>
                              <div>
                                {payment.dueDate ? (
                                  <>
                                    <div className="text-xs text-base-content/60">
                                      Due: {payment.dueDate.toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                    </div>
                                    <div>
                                      Paid: {payment.date.toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </div>
                                  </>
                                ) : (
                                  payment.date.toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-outline badge-sm">
                                {payment.type === "EXPENSE"
                                  ? "Expense"
                                  : payment.type === "BILL_PAYMENT"
                                    ? "Bill"
                                    : "Settlement"}
                              </span>
                            </td>
                            <td className="font-medium">{payment.description}</td>
                            <td className="font-bold">
                              {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                              }).format(payment.amount)}
                            </td>
                            <td>
                              {payment.isOnTime ? (
                                <span className="badge badge-success badge-sm">On Time</span>
                              ) : payment.delayDays !== undefined && payment.delayDays > 0 ? (
                                <span className="badge badge-error badge-sm">
                                  Late ({payment.delayDays} days)
                                </span>
                              ) : (
                                <span className="badge badge-error badge-sm">Late</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {score.paymentHistory.length > 20 && (
                      <div className="text-center text-sm text-base-content/60 mt-2">
                        Showing last 20 of {score.paymentHistory.length} payments
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-action">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        <label className="modal-backdrop" onClick={onClose}></label>
      </div>
    </>
  );
}

export default function MoneyVibesPage() {
  const { expenses, getExpensesByFlatId } = useExpenses();
  const { members } = useMembers();
  const { getCurrentFlatId, currentFlat } = useFlat();
  const { getPaymentsByFlatId } = useBillPayments();
  const { bills, getBillsByFlatId } = useBills();
  const { settlements, getSettlementsByFlatId } = useSettlements();
  const currentFlatId = getCurrentFlatId();

  const [selectedMember, setSelectedMember] = useState<MemberReliabilityScore | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "EXCELLENT" | "GOOD" | "FAIR" | "POOR">("ALL");

  const flatExpenses = useMemo(() => {
    if (!currentFlatId) return [];
    return getExpensesByFlatId(currentFlatId);
  }, [expenses, currentFlatId, getExpensesByFlatId]);

  const flatBills = useMemo(() => {
    if (!currentFlatId) return [];
    return getBillsByFlatId(currentFlatId);
  }, [bills, currentFlatId, getBillsByFlatId]);

  const flatSettlements = useMemo(() => {
    if (!currentFlatId) return [];
    return getSettlementsByFlatId(currentFlatId);
  }, [settlements, currentFlatId, getSettlementsByFlatId]);

  const flatBillPayments = useMemo(() => {
    if (!currentFlatId) return [];
    return getPaymentsByFlatId(currentFlatId);
  }, [currentFlatId, getPaymentsByFlatId]);

  const reliabilityScores = useMemo(() => {
    if (!currentFlatId) return [];
    return calculateReliabilityScores(
      members,
      flatExpenses,
      flatBillPayments,
      flatSettlements,
      flatBills,
      currentFlatId
    );
  }, [members, flatExpenses, flatBillPayments, flatSettlements, flatBills, currentFlatId]);

  // Filter scores by status
  const filteredScores = useMemo(() => {
    if (statusFilter === "ALL") return reliabilityScores;
    return reliabilityScores.filter((s) => s.status === statusFilter);
  }, [reliabilityScores, statusFilter]);

  // Calculate overall PG health
  const pgHealth = useMemo(() => {
    if (reliabilityScores.length === 0) {
      return {
        averageScore: 0,
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
      };
    }

    const averageScore = Math.round(
      reliabilityScores.reduce((sum, s) => sum + s.score, 0) / reliabilityScores.length
    );

    return {
      averageScore,
      excellent: reliabilityScores.filter((s) => s.status === "EXCELLENT").length,
      good: reliabilityScores.filter((s) => s.status === "GOOD").length,
      fair: reliabilityScores.filter((s) => s.status === "FAIR").length,
      poor: reliabilityScores.filter((s) => s.status === "POOR").length,
    };
  }, [reliabilityScores]);

  return (
    <>
      <PageHeader
        title="Money Vibes"
        subtitle="Fairness & reliability scores for all members"
      />

      <NoFlatBanner />

      {/* Filters */}
      {reliabilityScores.length > 0 && (
        <div className="card bg-base-100 shadow-sm mb-6">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="label">
                  <span className="label-text font-semibold">Filter by Status:</span>
                </label>
                <select
                  className="select select-bordered w-full sm:w-auto"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "ALL" | "EXCELLENT" | "GOOD" | "FAIR" | "POOR"
                    )
                  }
                >
                  <option value="ALL">All Members</option>
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
              <div className="text-sm text-base-content/60">
                Showing {filteredScores.length} of {reliabilityScores.length} members
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overall PG Health */}
      {reliabilityScores.length > 0 && (
        <div className="card bg-base-100 shadow-sm mb-6">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Overall PG Health</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title">Average Score</div>
                <div className={`stat-value text-2xl ${getReliabilityStatusColor(
                  pgHealth.averageScore >= 90
                    ? "EXCELLENT"
                    : pgHealth.averageScore >= 75
                      ? "GOOD"
                      : pgHealth.averageScore >= 60
                        ? "FAIR"
                        : "POOR"
                )}`}>
                  {pgHealth.averageScore}
                </div>
                <div className="stat-desc">Out of 100</div>
              </div>
              <div className="stat bg-success/10 rounded-lg p-4">
                <div className="stat-title">Excellent</div>
                <div className="stat-value text-2xl text-success">{pgHealth.excellent}</div>
                <div className="stat-desc">Members</div>
              </div>
              <div className="stat bg-primary/10 rounded-lg p-4">
                <div className="stat-title">Good</div>
                <div className="stat-value text-2xl text-primary">{pgHealth.good}</div>
                <div className="stat-desc">Members</div>
              </div>
              <div className="stat bg-warning/10 rounded-lg p-4">
                <div className="stat-title">Fair</div>
                <div className="stat-value text-2xl text-warning">{pgHealth.fair}</div>
                <div className="stat-desc">Members</div>
              </div>
              <div className="stat bg-error/10 rounded-lg p-4">
                <div className="stat-title">Poor</div>
                <div className="stat-value text-2xl text-error">{pgHealth.poor}</div>
                <div className="stat-desc">Members</div>
              </div>
            </div>

            {/* Distribution Visualization */}
            <div className="mt-4">
              <div className="text-sm text-base-content/60 mb-2">Status Distribution</div>
              <div className="flex items-center gap-2 flex-wrap">
                {pgHealth.excellent > 0 && (
                  <div className="badge badge-success badge-lg">
                    Excellent: {pgHealth.excellent}
                  </div>
                )}
                {pgHealth.good > 0 && (
                  <div className="badge badge-primary badge-lg">
                    Good: {pgHealth.good}
                  </div>
                )}
                {pgHealth.fair > 0 && (
                  <div className="badge badge-warning badge-lg">
                    Fair: {pgHealth.fair}
                  </div>
                )}
                {pgHealth.poor > 0 && (
                  <div className="badge badge-error badge-lg">
                    Poor: {pgHealth.poor}
                  </div>
                )}
              </div>
              {/* Visual Bar */}
              <div className="flex h-4 rounded-full overflow-hidden mt-2 bg-base-200">
                {pgHealth.excellent > 0 && (
                  <div
                    className="bg-success"
                    style={{
                      width: `${(pgHealth.excellent / reliabilityScores.length) * 100}%`,
                    }}
                  ></div>
                )}
                {pgHealth.good > 0 && (
                  <div
                    className="bg-primary"
                    style={{
                      width: `${(pgHealth.good / reliabilityScores.length) * 100}%`,
                    }}
                  ></div>
                )}
                {pgHealth.fair > 0 && (
                  <div
                    className="bg-warning"
                    style={{
                      width: `${(pgHealth.fair / reliabilityScores.length) * 100}%`,
                    }}
                  ></div>
                )}
                {pgHealth.poor > 0 && (
                  <div
                    className="bg-error"
                    style={{
                      width: `${(pgHealth.poor / reliabilityScores.length) * 100}%`,
                    }}
                  ></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {reliabilityScores.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <p className="text-base-content/60 text-center py-8">
              No members found. Add members to see reliability scores.
            </p>
          </div>
        </div>
      ) : filteredScores.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <p className="text-base-content/60 text-center py-8">
              No members match the selected filter.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScores.map((score) => (
            <div
              key={score.memberId}
              className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-300 cursor-pointer"
              onClick={() => setSelectedMember(score)}
            >
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{score.memberName}</h3>
                    {currentFlat && (
                      <div className="text-sm text-base-content/60 mb-1">
                        {currentFlat.name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge ${getReliabilityStatusBadge(score.status)}`}>
                        {score.status}
                      </span>
                      <span className="badge badge-outline">
                        {getHealthIndicatorIcon(score.healthIndicator)}{" "}
                        {getHealthIndicatorText(score.healthIndicator)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getReliabilityStatusColor(score.status)}`}>
                      {score.score}
                    </div>
                    <div className="text-sm text-base-content/60">Score</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-base-200 rounded-full h-3 mb-4">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      score.status === "EXCELLENT"
                        ? "bg-success"
                        : score.status === "GOOD"
                          ? "bg-primary"
                          : score.status === "FAIR"
                            ? "bg-warning"
                            : "bg-error"
                    }`}
                    style={{ width: `${score.score}%` }}
                  ></div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-base-content/60">Total Paid</div>
                    <div className="font-bold text-success">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(score.totalPaid)}
                    </div>
                  </div>
                  <div>
                    <div className="text-base-content/60">Total Owed</div>
                    <div className="font-bold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(score.totalOwed)}
                    </div>
                  </div>
                  <div>
                    <div className="text-base-content/60">On Time</div>
                    <div className="font-bold text-success">{score.onTimePayments}</div>
                  </div>
                  <div>
                    <div className="text-base-content/60">Late</div>
                    <div className="font-bold text-error">{score.latePayments}</div>
                  </div>
                </div>

                {/* Quick Info */}
                {score.recentIssues.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-base-300">
                    <div className="text-xs text-base-content/60">
                      {score.recentIssues[0]}
                    </div>
                  </div>
                )}

                {score.longestOnTimeStreak > 0 && (
                  <div className="mt-2 text-xs text-success">
                    🎯 Longest streak: {score.longestOnTimeStreak} on-time payments
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="card bg-base-100 shadow-sm mt-6">
        <div className="card-body">
          <h3 className="card-title text-lg mb-2">How Scores Work</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-base-content/60">
            <li>
              <strong>Excellent (90-100):</strong> Always pays on time, reliable
            </li>
            <li>
              <strong>Good (75-89):</strong> Mostly on time, occasional delays
            </li>
            <li>
              <strong>Fair (60-74):</strong> Some delays, needs reminders
            </li>
            <li>
              <strong>Poor (0-59):</strong> Frequent delays, unreliable
            </li>
          </ul>
          <p className="text-xs text-base-content/60 mt-4 italic">
            Scores are calculated based on payment history, on-time payment rate, delay days,
            missed payments, and long on-time streaks. Click on any member card to see detailed
            payment history.
          </p>
        </div>
      </div>

      <MemberDetailModal
        score={selectedMember!}
        isOpen={selectedMember !== null}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
}
