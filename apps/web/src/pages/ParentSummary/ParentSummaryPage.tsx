import { useMemo } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "@flatflow/ui";
import {
  useExpenses,
  useBills,
  useMembers,
  useFlat,
  useBillPayments,
} from "../../hooks";
import { exportData, downloadExportedData } from "../../lib/dataExport";

export default function ParentSummaryPage() {
  const { expenses, getExpensesByFlatId } = useExpenses();
  const { bills, getBillsByFlatId } = useBills();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { payments: billPayments } = useBillPayments();
  const currentFlatId = getCurrentFlatId();

  const flatExpenses = useMemo(() => {
    if (!currentFlatId) return [];
    return getExpensesByFlatId(currentFlatId);
  }, [expenses, currentFlatId, getExpensesByFlatId]);

  const flatBills = useMemo(() => {
    if (!currentFlatId) return [];
    return getBillsByFlatId(currentFlatId);
  }, [bills, currentFlatId, getBillsByFlatId]);

  const flatMembers = useMemo(() => {
    if (!currentFlatId) return [];
    return members.filter((m) => m.flatId === currentFlatId);
  }, [members, currentFlatId]);

  // Get current month's data
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthExpenses = flatExpenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= startOfMonth && expDate <= endOfMonth;
    });

    const monthBillPayments = billPayments.filter((payment) => {
      const paymentDate = new Date(payment.paidDate);
      return paymentDate >= startOfMonth && paymentDate <= endOfMonth;
    });

    const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBills = monthBillPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalSpending = totalExpenses + totalBills;

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    monthExpenses.forEach((exp) => {
      categoryBreakdown[exp.category] =
        (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    // Bill category breakdown
    monthBillPayments.forEach((payment) => {
      const bill = flatBills.find((b) => b.id === payment.billId);
      if (bill) {
        categoryBreakdown[bill.category] =
          (categoryBreakdown[bill.category] || 0) + payment.amount;
      }
    });

    return {
      month: now.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      totalSpending,
      totalExpenses,
      totalBills,
      categoryBreakdown,
      expenses: monthExpenses,
      billPayments: monthBillPayments,
    };
  }, [flatExpenses, flatBills, billPayments]);

  const getMemberName = (memberId: string) => {
    const member = flatMembers.find((m) => m.id === memberId);
    return member ? member.name : `Member ${memberId.slice(-4)}`;
  };

  const handleExportPDF = () => {
    // For now, export as JSON. PDF export would require a library like jsPDF
    const summary = {
      month: currentMonthData.month,
      totalSpending: currentMonthData.totalSpending,
      breakdown: currentMonthData.categoryBreakdown,
      expenses: currentMonthData.expenses.map((exp) => ({
        description: exp.description,
        amount: exp.amount,
        date: exp.date,
        category: exp.category,
        paidBy: getMemberName(exp.paidByMemberId),
      })),
      bills: currentMonthData.billPayments.map((payment) => {
        const bill = flatBills.find((b) => b.id === payment.billId);
        return {
          name: bill?.name || "Unknown Bill",
          amount: payment.amount,
          date: payment.paidDate,
          paidBy: getMemberName(payment.paidByMemberId),
        };
      }),
    };

    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `parent-summary-${currentMonthData.month.toLowerCase().replace(/\s+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Parent Summary"
        subtitle={`Monthly spending report for ${currentMonthData.month}`}
        actions={
          <Button variant="primary" onClick={handleExportPDF}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export Summary
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Total Spending</div>
              <div className="stat-value text-3xl">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(currentMonthData.totalSpending)}
              </div>
              <div className="stat-desc">{currentMonthData.month}</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Expenses</div>
              <div className="stat-value text-3xl text-primary">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(currentMonthData.totalExpenses)}
              </div>
              <div className="stat-desc">
                {currentMonthData.expenses.length} transactions
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="stat">
              <div className="stat-title">Bills</div>
              <div className="stat-value text-3xl text-secondary">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(currentMonthData.totalBills)}
              </div>
              <div className="stat-desc">
                {currentMonthData.billPayments.length} payments
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Category Breakdown</h2>
          <div className="space-y-2">
            {Object.entries(currentMonthData.categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="font-medium">{category}</span>
                  <span className="font-bold">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(amount)}
                  </span>
                </div>
              ))}
            {Object.keys(currentMonthData.categoryBreakdown).length === 0 && (
              <p className="text-base-content/60 text-center py-4">
                No spending this month
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Recent Expenses</h2>
          {currentMonthData.expenses.length === 0 ? (
            <p className="text-base-content/60 text-center py-4">
              No expenses this month
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Paid By</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthData.expenses
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((expense) => (
                      <tr key={expense.id}>
                        <td>
                          {new Date(expense.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="font-medium">{expense.description}</td>
                        <td>
                          <span className="badge badge-outline badge-sm">
                            {expense.category}
                          </span>
                        </td>
                        <td>{getMemberName(expense.paidByMemberId)}</td>
                        <td className="font-bold">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(expense.amount)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bill Payments */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Bill Payments</h2>
          {currentMonthData.billPayments.length === 0 ? (
            <p className="text-base-content/60 text-center py-4">
              No bill payments this month
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Bill</th>
                    <th>Paid By</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthData.billPayments
                    .sort(
                      (a, b) =>
                        new Date(b.paidDate).getTime() -
                        new Date(a.paidDate).getTime()
                    )
                    .map((payment) => {
                      const bill = flatBills.find((b) => b.id === payment.billId);
                      return (
                        <tr key={payment.id}>
                          <td>
                            {new Date(payment.paidDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </td>
                          <td className="font-medium">
                            {bill?.name || "Unknown Bill"}
                          </td>
                          <td>{getMemberName(payment.paidByMemberId)}</td>
                          <td className="font-bold">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                            }).format(payment.amount)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

