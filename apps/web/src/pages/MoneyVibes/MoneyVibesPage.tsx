import { useMemo } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { useExpenses, useMembers, useFlat, useBillPayments, useSettlements } from "../../hooks";
import { calculateReliabilityScores, getReliabilityStatusBadge, getReliabilityStatusColor } from "../../lib/reliabilityScores";

export default function MoneyVibesPage() {
  const { expenses, getExpensesByFlatId } = useExpenses();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { payments: billPayments } = useBillPayments();
  const { settlements, getSettlementsByFlatId } = useSettlements();
  const currentFlatId = getCurrentFlatId();

  const flatExpenses = useMemo(() => {
    if (!currentFlatId) return [];
    return getExpensesByFlatId(currentFlatId);
  }, [expenses, currentFlatId, getExpensesByFlatId]);

  const flatSettlements = useMemo(() => {
    if (!currentFlatId) return [];
    return getSettlementsByFlatId(currentFlatId);
  }, [settlements, currentFlatId, getSettlementsByFlatId]);

  const flatBillPayments = useMemo(() => {
    if (!currentFlatId) return [];
    return billPayments.filter((p) => p.flatId === currentFlatId);
  }, [billPayments, currentFlatId]);

  const reliabilityScores = useMemo(() => {
    if (!currentFlatId) return [];
    return calculateReliabilityScores(
      members,
      flatExpenses,
      flatBillPayments,
      flatSettlements,
      currentFlatId
    );
  }, [members, flatExpenses, flatBillPayments, flatSettlements, currentFlatId]);

  return (
    <>
      <PageHeader
        title="Money Vibes"
        subtitle="Fairness & reliability scores for all members"
      />

      {reliabilityScores.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <p className="text-base-content/60 text-center py-8">
              No members found. Add members to see reliability scores.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reliabilityScores.map((score) => (
            <div
              key={score.memberId}
              className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-300"
            >
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{score.memberName}</h3>
                    <span className={`badge ${getReliabilityStatusBadge(score.status)}`}>
                      {score.status}
                    </span>
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
            Scores are calculated based on payment history, on-time payment rate, and
            payment ratio (paid vs owed).
          </p>
        </div>
      </div>
    </>
  );
}

