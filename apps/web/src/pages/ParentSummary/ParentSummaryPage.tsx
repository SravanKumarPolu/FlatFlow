import { useState, useMemo, useCallback } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { NoFlatBanner } from "../../components/common/NoFlatBanner";
import { Button } from "@flatflow/ui";
import {
  useExpenses,
  useBills,
  useMembers,
  useFlat,
  useBillPayments,
} from "../../hooks";
import { generateParentSummaryPDF, ParentSummaryData } from "../../lib/pdfExport";

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  expenses: number;
  bills: number;
}

export default function ParentSummaryPage() {
  const { expenses, getExpensesByFlatId } = useExpenses();
  const { bills, getBillsByFlatId } = useBills();
  const { members } = useMembers();
  const { getCurrentFlatId } = useFlat();
  const { getPaymentsByFlatId } = useBillPayments();
  const currentFlatId = getCurrentFlatId();

  // Month/year selector state
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

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

  const flatBillPayments = useMemo(() => {
    if (!currentFlatId) return [];
    return getPaymentsByFlatId(currentFlatId);
  }, [currentFlatId, getPaymentsByFlatId]);

  const getMemberName = useCallback(
    (memberId: string) => {
      const member = flatMembers.find((m) => m.id === memberId);
      return member ? member.name : `Member ${memberId.slice(-4)}`;
    },
    [flatMembers]
  );

  // Get selected month's data
  const monthData = useMemo(() => {
    const startOfMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfMonth = new Date(
      selectedYear,
      selectedMonth + 1,
      0,
      23,
      59,
      59
    );

    const monthExpenses = flatExpenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= startOfMonth && expDate <= endOfMonth;
    });

    const monthBillPayments = flatBillPayments.filter((payment) => {
      const paymentDate = new Date(payment.paidDate);
      return paymentDate >= startOfMonth && paymentDate <= endOfMonth;
    });

    const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBills = monthBillPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalSpending = totalExpenses + totalBills;

    // Category breakdown with type separation
    const categoryMap: Record<
      string,
      { total: number; expenses: number; bills: number }
    > = {};

    // Add expenses to category breakdown
    monthExpenses.forEach((exp) => {
      if (!categoryMap[exp.category]) {
        categoryMap[exp.category] = { total: 0, expenses: 0, bills: 0 };
      }
      categoryMap[exp.category].total += exp.amount;
      categoryMap[exp.category].expenses += exp.amount;
    });

    // Add bill payments to category breakdown
    monthBillPayments.forEach((payment) => {
      const bill = flatBills.find((b) => b.id === payment.billId);
      if (bill) {
        if (!categoryMap[bill.category]) {
          categoryMap[bill.category] = { total: 0, expenses: 0, bills: 0 };
        }
        categoryMap[bill.category].total += payment.amount;
        categoryMap[bill.category].bills += payment.amount;
      }
    });

    // Convert to array with percentages
    const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryMap)
      .map(([category, data]) => ({
        category,
        amount: data.total,
        percentage:
          totalSpending > 0 ? (data.total / totalSpending) * 100 : 0,
        expenses: data.expenses,
        bills: data.bills,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Get top 3 categories
    const topCategories = categoryBreakdown.slice(0, 3);

    // Get largest single transactions (combine expenses and bill payments)
    const allTransactions = [
      ...monthExpenses.map((exp) => ({
        id: exp.id,
        type: "EXPENSE" as const,
        description: exp.description,
        amount: exp.amount,
        date: exp.date,
        category: exp.category,
        paidByMemberId: exp.paidByMemberId,
      })),
      ...monthBillPayments.map((payment) => {
        const bill = flatBills.find((b) => b.id === payment.billId);
        return {
          id: payment.id,
          type: "BILL_PAYMENT" as const,
          description: bill?.name || "Unknown Bill",
          amount: payment.amount,
          date: payment.paidDate,
          category: bill?.category || "OTHER",
          paidByMemberId: payment.paidByMemberId,
        };
      }),
    ].sort((a, b) => b.amount - a.amount);

    // Get top 3 largest transactions
    const largestTransactions = allTransactions.slice(0, 3);

    return {
      month: new Date(selectedYear, selectedMonth).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
      monthKey: `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`,
      totalSpending,
      totalExpenses,
      totalBills,
      categoryBreakdown,
      topCategories,
      largestTransactions,
      expenses: monthExpenses,
      billPayments: monthBillPayments,
    };
  }, [
    flatExpenses,
    flatBills,
    flatBillPayments,
    selectedYear,
    selectedMonth,
  ]);

  // Generate month options (last 12 months)
  const monthOptions = useMemo(() => {
    const options: { year: number; month: number; label: string }[] = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      options.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        }),
      });
    }
    return options;
  }, []);

  const handleExport = () => {
    const exportData = {
      summary: {
        month: monthData.month,
        monthKey: monthData.monthKey,
        totalSpending: monthData.totalSpending,
        totalExpenses: monthData.totalExpenses,
        totalBills: monthData.totalBills,
      },
      categoryBreakdown: monthData.categoryBreakdown.map((cat) => ({
        category: cat.category,
        amount: cat.amount,
        percentage: cat.percentage,
        expenses: cat.expenses,
        bills: cat.bills,
      })),
      topCategories: monthData.topCategories.map((cat) => ({
        category: cat.category,
        amount: cat.amount,
        percentage: cat.percentage,
      })),
      largestTransactions: monthData.largestTransactions.map((txn) => ({
        id: txn.id,
        type: txn.type,
        description: txn.description,
        amount: txn.amount,
        date: txn.date,
        category: txn.category,
        paidBy: getMemberName(txn.paidByMemberId),
        paidByMemberId: txn.paidByMemberId,
      })),
      transactions: {
        expenses: monthData.expenses.map((exp) => ({
          id: exp.id,
          type: "EXPENSE",
          description: exp.description,
          amount: exp.amount,
          date: exp.date,
          category: exp.category,
          paidBy: getMemberName(exp.paidByMemberId),
          paidByMemberId: exp.paidByMemberId,
        })),
        billPayments: monthData.billPayments.map((payment) => {
          const bill = flatBills.find((b) => b.id === payment.billId);
          return {
            id: payment.id,
            type: "BILL_PAYMENT",
            billName: bill?.name || "Unknown Bill",
            billId: payment.billId,
            amount: payment.amount,
            date: payment.paidDate,
            category: bill?.category || "OTHER",
            paidBy: getMemberName(payment.paidByMemberId),
            paidByMemberId: payment.paidByMemberId,
            note: payment.note,
          };
        }),
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `parent-summary-${monthData.monthKey}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const pdfData: ParentSummaryData = {
      month: monthData.month,
      monthKey: monthData.monthKey,
      totalSpending: monthData.totalSpending,
      totalExpenses: monthData.totalExpenses,
      totalBills: monthData.totalBills,
      categoryBreakdown: monthData.categoryBreakdown.map((cat) => ({
        category: cat.category,
        amount: cat.amount,
        percentage: cat.percentage,
        expenses: cat.expenses,
        bills: cat.bills,
      })),
      topCategories: monthData.topCategories.map((cat) => ({
        category: cat.category,
        amount: cat.amount,
        percentage: cat.percentage,
      })),
      largestTransactions: monthData.largestTransactions.map((txn) => ({
        id: txn.id,
        type: txn.type === "BILL_PAYMENT" ? "BILL" : txn.type,
        description: txn.description,
        amount: txn.amount,
        date: txn.date,
        category: txn.category,
        paidBy: getMemberName(txn.paidByMemberId),
      })),
    };

    generateParentSummaryPDF(pdfData);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      RENT: "bg-primary",
      UTILITY: "bg-secondary",
      FOOD: "bg-accent",
      GROCERY: "bg-info",
      TRAVEL: "bg-warning",
      SWIGGY: "bg-success",
      OLA_UBER: "bg-error",
      MAID: "bg-base-300",
      OTHER: "bg-base-200",
    };
    return colors[category] || "bg-base-200";
  };

  return (
    <>
      <PageHeader
        title="Parent Summary"
        subtitle="Monthly spending report"
        actions={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleExport}
              disabled={monthData.totalSpending === 0}
              title={
                monthData.totalSpending === 0
                  ? "No data to export"
                  : "Export monthly summary as JSON"
              }
            >
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
              Export JSON
            </Button>
            <Button
              variant="primary"
              onClick={handleExportPDF}
              disabled={monthData.totalSpending === 0}
              title={
                monthData.totalSpending === 0
                  ? "No data to export"
                  : "Export monthly summary as PDF"
              }
            >
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
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Export PDF
            </Button>
          </div>
        }
      />

      <NoFlatBanner />

      {/* Month Selector */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="label">
              <span className="label-text font-semibold">Select Month:</span>
            </label>
            <select
              className="select select-bordered w-full sm:w-auto"
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split("-").map(Number);
                setSelectedYear(year);
                setSelectedMonth(month);
              }}
            >
              {monthOptions.map((option) => (
                <option
                  key={`${option.year}-${option.month}`}
                  value={`${option.year}-${option.month}`}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* This Month's Summary */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">
            {monthData.month}'s Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat bg-base-200 rounded-lg p-4">
              <div className="stat-title">Total Spending</div>
              <div className="stat-value text-3xl">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(monthData.totalSpending)}
              </div>
              <div className="stat-desc">{monthData.month}</div>
            </div>

            <div className="stat bg-primary/10 rounded-lg p-4">
              <div className="stat-title">Expenses</div>
              <div className="stat-value text-3xl text-primary">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(monthData.totalExpenses)}
              </div>
              <div className="stat-desc">
                {monthData.expenses.length} transactions
              </div>
            </div>

            <div className="stat bg-secondary/10 rounded-lg p-4">
              <div className="stat-title">Bills</div>
              <div className="stat-value text-3xl text-secondary">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(monthData.totalBills)}
              </div>
              <div className="stat-desc">
                {monthData.billPayments.length} payments
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top 3 Categories */}
        {monthData.topCategories.length > 0 && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Top 3 Categories</h2>
              <div className="space-y-3">
                {monthData.topCategories.map((cat, index) => (
                  <div key={cat.category} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{cat.category}</span>
                        <span className="font-bold">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(cat.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-base-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getCategoryColor(cat.category)}`}
                          style={{ width: `${cat.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-base-content/60 mt-1">
                        {cat.percentage.toFixed(1)}% of total spending
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Largest Single Transactions */}
        {monthData.largestTransactions.length > 0 && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">
                Largest Single Transactions
              </h2>
              <div className="space-y-3">
                {monthData.largestTransactions.map((txn, index) => (
                  <div key={txn.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-secondary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <div className="font-semibold">{txn.description}</div>
                          <div className="text-xs text-base-content/60">
                            {new Date(txn.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            • {txn.type === "EXPENSE" ? "Expense" : "Bill Payment"}
                          </div>
                        </div>
                        <span className="font-bold text-lg">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(txn.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge badge-outline badge-sm">
                          {txn.category}
                        </span>
                        <span className="text-xs text-base-content/60">
                          Paid by {getMemberName(txn.paidByMemberId)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* By Category */}
      <div className="card bg-base-100 shadow-sm mb-6">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">By Category</h2>
          {monthData.categoryBreakdown.length === 0 ? (
            <p className="text-base-content/60 text-center py-4">
              No spending in {monthData.month}
            </p>
          ) : (
            <div className="space-y-4">
              {monthData.categoryBreakdown.map((cat) => (
                <div key={cat.category}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{cat.category}</span>
                      <span className="badge badge-outline badge-sm">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(cat.amount)}
                      </div>
                      <div className="text-xs text-base-content/60">
                        {cat.expenses > 0 && (
                          <span>Expenses: {cat.expenses.toFixed(0)}</span>
                        )}
                        {cat.expenses > 0 && cat.bills > 0 && " • "}
                        {cat.bills > 0 && (
                          <span>Bills: {cat.bills.toFixed(0)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-base-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getCategoryColor(cat.category)}`}
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expenses & Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Expenses</h2>
            {monthData.expenses.length === 0 ? (
              <p className="text-base-content/60 text-center py-4">
                No expenses in {monthData.month}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthData.expenses
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((expense) => (
                        <tr key={expense.id}>
                          <td>
                            {new Date(expense.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </td>
                          <td className="font-medium">
                            {expense.description}
                          </td>
                          <td>
                            <span className="badge badge-outline badge-sm">
                              {expense.category}
                            </span>
                          </td>
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
            {monthData.billPayments.length === 0 ? (
              <p className="text-base-content/60 text-center py-4">
                No bill payments in {monthData.month}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Bill</th>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthData.billPayments
                      .sort(
                        (a, b) =>
                          new Date(b.paidDate).getTime() -
                          new Date(a.paidDate).getTime()
                      )
                      .map((payment) => {
                        const bill = flatBills.find(
                          (b) => b.id === payment.billId
                        );
                        return (
                          <tr key={payment.id}>
                            <td>
                              {new Date(
                                payment.paidDate
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </td>
                            <td className="font-medium">
                              {bill?.name || "Unknown Bill"}
                            </td>
                            <td>
                              <span className="badge badge-outline badge-sm">
                                {bill?.category || "OTHER"}
                              </span>
                            </td>
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
      </div>
    </>
  );
}
