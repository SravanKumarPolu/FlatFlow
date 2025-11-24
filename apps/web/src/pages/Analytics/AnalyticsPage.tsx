import { useMemo } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "@flatflow/ui";
import { useExpenses, useBills, useBillPayments, useFlat } from "../../hooks";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ExpenseCategory } from "@flatflow/core";

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  RENT: "#3b82f6",
  UTILITY: "#10b981",
  FOOD: "#f59e0b",
  TRAVEL: "#ef4444",
  GROCERY: "#8b5cf6",
  SWIGGY: "#ff6b6b",
  OLA_UBER: "#4ecdc4",
  OTHER: "#ec4899",
};

export default function AnalyticsPage() {
  const { expenses } = useExpenses();
  const { bills, getBillsByFlatId } = useBills();
  const { payments: billPayments } = useBillPayments();
  const { getCurrentFlatId } = useFlat();
  const currentFlatId = getCurrentFlatId();

  // Filter expenses for current flat
  const flatExpenses = useMemo(() => {
    if (!currentFlatId) return [];
    return expenses.filter((exp) => exp.flatId === currentFlatId);
  }, [expenses, currentFlatId]);

  // Filter bills and payments for current flat
  const flatBills = useMemo(() => {
    if (!currentFlatId) return [];
    return getBillsByFlatId(currentFlatId);
  }, [bills, currentFlatId, getBillsByFlatId]);

  const flatBillPayments = useMemo(() => {
    if (!currentFlatId) return [];
    return billPayments.filter((p) => p.flatId === currentFlatId);
  }, [billPayments, currentFlatId]);

  // Monthly spending data (last 6 months)
  const monthlySpending = useMemo(() => {
    const now = new Date();
    const months: { month: string; amount: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString();

      const monthExpenses = flatExpenses.filter(
        (exp) => exp.date >= monthStart && exp.date <= monthEnd
      );

      const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      months.push({
        month: date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
        amount: total,
      });
    }

    return months;
  }, [flatExpenses]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const categoryTotals: Record<ExpenseCategory, number> = {
      RENT: 0,
      UTILITY: 0,
      FOOD: 0,
      TRAVEL: 0,
      GROCERY: 0,
      SWIGGY: 0,
      OLA_UBER: 0,
      OTHER: 0,
    };

    flatExpenses.forEach((exp) => {
      categoryTotals[exp.category] += exp.amount;
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        color: CATEGORY_COLORS[category as ExpenseCategory],
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [flatExpenses]);

  // Expense trends (daily for last 30 days)
  const expenseTrends = useMemo(() => {
    const now = new Date();
    const days: { date: string; amount: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ).toISOString();
      const dayEnd = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59
      ).toISOString();

      const dayExpenses = flatExpenses.filter(
        (exp) => exp.date >= dayStart && exp.date <= dayEnd
      );

      const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      days.push({
        date: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        amount: total,
      });
    }

    return days;
  }, [flatExpenses]);

  // Calculate total spending (expenses + bill payments)
  const totalExpenses = flatExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBillPayments = flatBillPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalSpending = totalExpenses + totalBillPayments;
  const averageMonthly = monthlySpending.reduce((sum, m) => sum + m.amount, 0) / 6;

  // Monthly bill payments (last 6 months)
  const monthlyBillPayments = useMemo(() => {
    const now = new Date();
    const months: { month: string; amount: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString();

      const monthPayments = flatBillPayments.filter(
        (p) => p.paidDate >= monthStart && p.paidDate <= monthEnd
      );

      const total = monthPayments.reduce((sum, p) => sum + p.amount, 0);

      months.push({
        month: date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
        amount: total,
      });
    }

    return months;
  }, [flatBillPayments]);

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Insights into your spending patterns"
      />

      {flatExpenses.length === 0 ? (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="text-center py-8">
              <p className="text-base-content/60">No expenses to analyze yet</p>
              <p className="text-sm text-base-content/60 mt-2">
                Add some expenses to see charts and insights
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card variant="bordered">
              <div className="card-body p-4">
                <p className="text-sm text-base-content/60">Total Spending</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(totalSpending)}
                </p>
              </div>
            </Card>
            <Card variant="bordered">
              <div className="card-body p-4">
                <p className="text-sm text-base-content/60">Avg Monthly</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(averageMonthly)}
                </p>
              </div>
            </Card>
            <Card variant="bordered">
              <div className="card-body p-4">
                <p className="text-sm text-base-content/60">Expenses</p>
                <p className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(totalExpenses)}
                </p>
                <p className="text-xs text-base-content/60">{flatExpenses.length} transactions</p>
              </div>
            </Card>
            <Card variant="bordered">
              <div className="card-body p-4">
                <p className="text-sm text-base-content/60">Bills</p>
                <p className="text-2xl font-bold text-secondary">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(totalBillPayments)}
                </p>
                <p className="text-xs text-base-content/60">{flatBillPayments.length} payments</p>
              </div>
            </Card>
          </div>

          {/* Monthly Spending Bar Chart (Combined) */}
          <Card variant="bordered">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Monthly Spending</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={monthlySpending.map((exp, idx) => ({
                    ...exp,
                    expenses: exp.amount,
                    bills: monthlyBillPayments[idx]?.amount || 0,
                    total: exp.amount + (monthlyBillPayments[idx]?.amount || 0),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                        notation: "compact",
                      }).format(value)
                    }
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(value)
                    }
                  />
                  <Legend />
                  <Bar dataKey="expenses" fill="#3b82f6" name="Expenses" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="bills" fill="#10b981" name="Bills" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Breakdown Pie Chart */}
          <Card variant="bordered">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Category Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(value)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Expense Trends Line Chart */}
          <Card variant="bordered">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Expense Trends (Last 30 Days)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={expenseTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                        notation: "compact",
                      }).format(value)
                    }
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(value)
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

